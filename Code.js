const ALLOWED_LABEL_NAME = "--Allow";
const DISALLOWED_LABEL_NAME = "--Disallow";
const SCREENING_LABEL_NAME = "--Screen";
const NUMBER_THREADS_TO_FILTER_ON = 150;
const ALLOWED_LABEL = GmailApp.getUserLabelByName(ALLOWED_LABEL_NAME);
const DISALLOWED_LABEL = GmailApp.getUserLabelByName(DISALLOWED_LABEL_NAME);
const SCREENING_LABEL = GmailApp.getUserLabelByName(SCREENING_LABEL_NAME);
const DATABASE_SPREADSHEEET_PROPERTY_NAME = "DATABASE_SPREADSHEET_URL";
var DATABASE_SPREADSHEET_URL = "";
var DATABASE_SPREADSHEET = null;
const ALLOWED_SENDERS_SHEET_NAME = "ALLOWED SENDERS";
const DISALLOWED_SENDERS_SHEET_NAME = "DISALLOWED SENDERS";

const UPDATE_ALLOWED_FUNCTION_NAME = 'updated_allowed_senders_from_labelled_threads';
const UPDATE_DISALLOWED_FUNCTION_NAME = 'updated_disallowed_senders_from_labelled_threads';
const MOVE_UNKNOWN_AND_DISALLOWED_FUNCTION_NAME = 'move_unknown_and_disallowed_senders_from_inbox';

/***
DEPLOY
***/
function doGet(e) {
  init();
  var t = HtmlService.createTemplateFromFile("index");

  // Checkboxes
  var database = _getDatabaseSpreadsheet();
  var label_allowed = GmailApp.getUserLabelByName(ALLOWED_LABEL_NAME);
  var label_disallowed = GmailApp.getUserLabelByName(DISALLOWED_LABEL_NAME);
  var label_screen = GmailApp.getUserLabelByName(SCREENING_LABEL_NAME);
  var allTriggerNames = _getAllTriggerFunctionNames();
  var trigger_allowed = allTriggerNames.includes(UPDATE_ALLOWED_FUNCTION_NAME);
  var trigger_disallowed = allTriggerNames.includes(UPDATE_DISALLOWED_FUNCTION_NAME);
  var trigger_move = allTriggerNames.includes(MOVE_UNKNOWN_AND_DISALLOWED_FUNCTION_NAME);
  
  t.data = {
    database_url: database.getUrl(),
    label_allowed: label_allowed,
    label_disallowed: label_disallowed,
    label_screen: label_screen,
    trigger_allowed: trigger_allowed,
    trigger_disallowed: trigger_disallowed,
    trigger_move: trigger_move
  };
  return t.evaluate();
}

/***
INITIALIZATION
***/
function init() {
  _createAndLinkDatabaseIfNotExist();
  _createGmailLabelsIfNotExist();
  _createTriggersIfNotExists();

  function _createAndLinkDatabaseIfNotExist() {
    var props = PropertiesService.getUserProperties();
    var spreadsheet_url = props.getProperty(DATABASE_SPREADSHEEET_PROPERTY_NAME);
    if (!spreadsheet_url) {
      
      var spreadsheet = SpreadsheetApp.create("GIC - Gmail Inbox Control: Database");
      var sheet = spreadsheet.getActiveSheet();
      sheet.setName(ALLOWED_SENDERS_SHEET_NAME);
      spreadsheet.insertSheet(DISALLOWED_SENDERS_SHEET_NAME);
      spreadsheet_url = spreadsheet.getUrl();
      
      Logger.log("Spreadsheet database created, at url: %s", spreadsheet_url);
      props.setProperty(DATABASE_SPREADSHEEET_PROPERTY_NAME, spreadsheet_url);
    }
  }
  function _createGmailLabelsIfNotExist() {
    // Create Labels
    var labelObjects = GmailApp.getUserLabels();
    var labels = labelObjects.map(labelObj => labelObj.getName());

    if (!labels.includes(ALLOWED_LABEL_NAME)) {
      GmailApp.createLabel(ALLOWED_LABEL_NAME);
    }

    if (!labels.includes(DISALLOWED_LABEL_NAME)) {
      GmailApp.createLabel(DISALLOWED_LABEL_NAME);
    }

    if (!labels.includes(SCREENING_LABEL_NAME)) {
      GmailApp.createLabel(SCREENING_LABEL_NAME);
    }
  }
  function _createTriggersIfNotExists() {
    var allTriggerNames = _getAllTriggerFunctionNames();
    if (!allTriggerNames.includes(UPDATE_ALLOWED_FUNCTION_NAME)) {
      ScriptApp.newTrigger(UPDATE_ALLOWED_FUNCTION_NAME)
      .timeBased()
      .everyMinutes(10)
      .create();
      Logger.log("Creating trigger: update allowed senders");
    }
    if (!allTriggerNames.includes(UPDATE_DISALLOWED_FUNCTION_NAME)) {
      ScriptApp.newTrigger(UPDATE_DISALLOWED_FUNCTION_NAME)
      .timeBased()
      .everyMinutes(10)
      .create();
      Logger.log("Creating trigger: update disallowed senders");
    }
    if (!allTriggerNames.includes(MOVE_UNKNOWN_AND_DISALLOWED_FUNCTION_NAME)) {
       ScriptApp.newTrigger(MOVE_UNKNOWN_AND_DISALLOWED_FUNCTION_NAME)
      .timeBased()
      .everyMinutes(10)
      .create();
      Logger.log("Creating trigger: move unallowed and disallowed");
    }
  }
}

/***
APPLICATION - Triggers
***/

function updated_allowed_senders_from_labelled_threads() {
  var allowed_senders_sheet = _getDatabaseSpreadsheet().getSheetByName(ALLOWED_SENDERS_SHEET_NAME);
  var allowed_senders = _get_allowed_senders();

  var threads_with_allowed_sender_label = GmailApp.search(`label:${ALLOWED_LABEL_NAME}`, 0, NUMBER_THREADS_TO_FILTER_ON);
  if (threads_with_allowed_sender_label.length == 0) {
    Logger.log("No threads labelled allowed sender, exiting.");
    return false;
  }

  for (var t=0; t<threads_with_allowed_sender_label.length; t++) {
    var thread = threads_with_allowed_sender_label[t];
    var firstSubject = thread.getFirstMessageSubject();
    var is_thread_in_inbox = thread.isInInbox();

    add_sender_of_thread_to_allowed_senders(thread);
    if (!is_thread_in_inbox) {
      Logger.log("%s: ✅ Thread NOT in inbox, removing labels from it! '%s'", t, firstSubject);
      remove_allowed_sender_label_from_thread_sender(thread);
      remove_screening_label_from_thread_sender(thread);
    } else {
      Logger.log("%s: Thread in inbox, not removing label from it. '%s'", t, firstSubject);
    }
    
  }

  function add_sender_to_allowed_senders(sender) {
    allowed_senders_sheet.appendRow([sender]);
  }

  function add_sender_of_thread_to_allowed_senders(thread) {
    var message = thread.getMessages()[0];
    var from = message.getFrom();
    var from_email_only = from;
    if (from_email_only.includes('<')) {
      from_email_only = /(?<=\<).+?(?=\>)/.exec(from)[0];
    }
    
    const is_already_an_allowed_sender = !!(allowed_senders.find(allowed_sender => {
      if (allowed_sender.includes(from_email_only) || from_email_only.includes(allowed_sender)) {
        return true;
      }
    }));

    if (is_already_an_allowed_sender) {
      Logger.log("Ignoring (%s), already part of allowed senders.", from_email_only);
    } else {
      Logger.log("✅ Adding (%s) to allowed senders!", from_email_only);
      add_sender_to_allowed_senders(from_email_only);
    }
  }

  function remove_allowed_sender_label_from_thread_sender(thread) {
    ALLOWED_LABEL.removeFromThread(thread);
  }

  function remove_screening_label_from_thread_sender(thread) {
    SCREENING_LABEL.removeFromThread(thread);
  }
}

function updated_disallowed_senders_from_labelled_threads() {
  var disallowed_senders_sheet = _getDatabaseSpreadsheet().getSheetByName(DISALLOWED_SENDERS_SHEET_NAME);
  var disallowed_senders = _get_disallowed_senders(disallowed_senders_sheet);

  var threads_with_disallowed_sender_label = GmailApp.search(`label:${DISALLOWED_LABEL_NAME}`, 0, NUMBER_THREADS_TO_FILTER_ON);
  if (threads_with_disallowed_sender_label.length == 0) {
    Logger.log("No threads labelled disallowed sender, exiting.");
    return false;
  }

  for (var t=0; t<threads_with_disallowed_sender_label.length; t++) {
    var thread = threads_with_disallowed_sender_label[t];
    var subject = thread.getFirstMessageSubject();

    add_sender_of_thread_to_disallowed_senders(thread);
    remove_disallowed_sender_label_from_thread_sender(thread);
    remove_screening_label_from_thread_sender(thread);
  }
  
  function add_sender_to_disallowed_senders(sender) {
    disallowed_senders_sheet.appendRow([sender]);
  }
  
  function add_sender_of_thread_to_disallowed_senders(thread) {
    var message = thread.getMessages()[0];
    var from = message.getFrom();
    var from_email_only = from;
    if (from_email_only.includes('<')) {
      from_email_only = /(?<=\<).+?(?=\>)/.exec(from)[0];
    }
    
    const is_already_a_disallowed_sender = !!(disallowed_senders.find(disallowed_sender => {
      if (disallowed_sender.includes(from_email_only) || from_email_only.includes(disallowed_sender)) {
        return true;
      }
    }));

    if (is_already_a_disallowed_sender) {
      Logger.log("Ignoring (%s), already part of disallowed senders.", from_email_only);
    } else {
      Logger.log("🚫 Adding (%s) to disallowed senders!", from_email_only);
      add_sender_to_disallowed_senders(from_email_only);
    }
  }
  
  function remove_disallowed_sender_label_from_thread_sender(thread) {
    DISALLOWED_LABEL.removeFromThread(thread);
  }

  function remove_screening_label_from_thread_sender(thread) {
    SCREENING_LABEL.removeFromThread(thread);
  }
}

function move_unknown_and_disallowed_senders_from_inbox() {
  var threads = GmailApp.search(`in:inbox AND NOT label:${ALLOWED_LABEL_NAME}`, 0, NUMBER_THREADS_TO_FILTER_ON);
  if (threads.length == 0) {
    Logger.log("No threads, exiting.");
    return;
  }
  // For each thread
  for (var t=0; t<threads.length; t++) {
    var thread = threads[t];
    var message = thread.getMessages()[0];
    var from = message.getFrom();

    var is_allowed = is_sender_allowed(from);
    if (is_allowed) {
      Logger.log("%s: ✅ ALLOWED, Marking... (%s) ", from, message.getSubject());
      mark_thread_as_allowed(thread);
      continue;
    }
    
    var is_disallowed = false;
    var is_disallowed = is_sender_disallowed(from);
    if (is_disallowed) {
      Logger.log("%s: 🚫 DISALLOWED, Archiving... (%s) ", from, message.getSubject());
      thread.moveToArchive();
      continue;
    }

    Logger.log("🕵🏼‍♂️ Unknown sender - Moving to Screening: %s (%s)", from, message.getSubject());
    move_thread_to_screener(thread);
  }

  function is_sender_allowed(sender) {
    var allowed_senders = _get_allowed_senders();
    var is_allowed = false;
    for (var i=0; i<allowed_senders.length; i++) {
      var allowed_sender = allowed_senders[i][0];
      is_allowed = sender.includes(allowed_sender);
      if (is_allowed) {
        break;
      }
    }
    return is_allowed;
  }

  function is_sender_disallowed(sender) {
    var disallowed_senders_sheet = _getDatabaseSpreadsheet().getSheetByName(DISALLOWED_SENDERS_SHEET_NAME);
    var disallowed_senders = _get_disallowed_senders(disallowed_senders_sheet);
    var is_disallowed = false;
    for (var i=0; i<disallowed_senders.length; i++) {
      var disallowed_sender = disallowed_senders[i][0];
      is_disallowed = sender.includes(disallowed_sender);
      if (is_disallowed) {
        break;
      }
    }
    return is_disallowed;
  }

  function mark_thread_as_allowed(thread) {
    ALLOWED_LABEL.addToThread(thread);
    SCREENING_LABEL.removeFromThread(thread);
  }

  function move_thread_to_screener(thread) {
    SCREENING_LABEL.addToThread(thread);
    thread.moveToArchive();
  }
}

/***
HELPERS
***/
function _getDatabaseSpreadsheet() {
  if (!DATABASE_SPREADSHEET) {
    var props = PropertiesService.getUserProperties();
    DATABASE_SPREADSHEET_URL = props.getProperty(DATABASE_SPREADSHEEET_PROPERTY_NAME);
  }
  if (!DATABASE_SPREADSHEET_URL) {
    throw new Error("No database spreadsheet url found in Script Properties, make sure you've run the init() command that sets up all configurations.");
  }
  return SpreadsheetApp.openByUrl(DATABASE_SPREADSHEET_URL);
}

function _get_allowed_senders() {
  var allowed_senders_sheet = _getDatabaseSpreadsheet().getSheetByName(ALLOWED_SENDERS_SHEET_NAME);

  var last_row = allowed_senders_sheet.getLastRow();
  if (last_row === 0) {
    return [];
  }
  var range = allowed_senders_sheet.getRange(1,1, last_row,1);
  var allowed_senders = range.getValues() || [];
  return allowed_senders;
}

function _get_disallowed_senders(disallowed_senders_sheet) {
  var last_row = disallowed_senders_sheet.getLastRow();
  if (last_row === 0) {
    return [];
  }
  var range = disallowed_senders_sheet.getRange(1,1, last_row,1);
  var disallowed_senders = range.getValues();
  return disallowed_senders;
}

function _getAllTriggerFunctionNames() {
    var allTriggers = ScriptApp.getProjectTriggers();
    let allTriggerHandleFunctionNames = [];
    for (var i=0; i<allTriggers.length; i++) {
      allTriggerHandleFunctionNames.push(allTriggers[i].getHandlerFunction());
    }
    return allTriggerHandleFunctionNames;
  }

function _manuallySetSpreadsheetUrl() {
    var props = PropertiesService.getUserProperties();
    DATABASE_SPREADSHEET_URL = props.setProperty(DATABASE_SPREADSHEEET_PROPERTY_NAME, "https://docs.google.com/spreadsheets/d/1U4-dnwVeiV8lC_K1BDVITx65jaG-m0NBthTuIXNM8kA/edit");
}
