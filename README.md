# Gmail Inbox Control
> <i>Take control of your Gmail Inbox!</i>

- Are you tired of strangers, irrelevant and cold emails coming straight into your Inbox?
- Are you annoyed by unknown senders being mixed into your important and urgent emails in your Inbox?

With the Gmail Inbox Control **only email senders that you have allowed will end up straight in your Inbox**. All other emails will end up in a Screening label in Gmail, for a later time.
From there you can easily Allow or Disallow new people from sending you emails.

It's implemented as a Google Web App, on top of Gmail & Google Spreadsheet. Inspired by [Hey’s Imbox](https://www.hey.com/features/the-imbox/), and technically from [gmailFilter](https://github.com/PlanetEfficacy/gmailFilter).


## How do I use it?
1. All new emails will be moved from your Inbox into the *"--Screen"* label.
1. In the *"--Screen"* label view, you can choose to **Allow** or **Disallow** the sender of that email to arrive in your inbox next time.
2. After this step, allowed email senders will stay in your Inbox, Disallowed or New email senders will not appear in your Inbox.

![image](https://github.com/mackeian/gic/assets/789341/0e72e74c-e3f4-4ee5-abf1-2c612b7058f8)


### Allow a sender
1. Go to *"--Screen"* label
1. Select one or multiple emails
1. Add the label *"--Allow"* to the selected emails
1. From now on, the senders will end up in your Inbox directly, and not go to screening.

![Allow](https://github.com/mackeian/gic/assets/789341/e7aaad87-376f-4902-9df5-feeefff4fa6c)

<em>Optionally: You can also select "Move to: Inbox" if you want to look at this email.</em>

### Disallow a sender
1. Go to *"--Screen"* label
2. Select one or multiple emails
3. Add the label *"--Disallow"* to the selected emails
4. From now on, the senders will **not** end up in your Inbox, but be archived directly once received.

### Technically: How does it work ?
* **Allow & Disallow**
  * (Every 10 mins): When you label an email with *"--Allow"* label, a Trigger script runs periodically and adds the email address to a list of Allowed senders (a tab in the Spreadsheet database).
  * (Every 10 mins) The emails you labelled with *"--Disallow"* follows the same pattern, but is instead added to Disallowed senders (a tab in the Spreadsheets database).
* **Filtering emails in your Inbox**
  * (Every 10 mins) The spreadsheet database of allowed and disallowed senders, is used to scan your Inbox and
    * 1) Keep emails from allowed senders (mark thenm with label **--Allow**), and
    * 2) Move Disallowed emails out of the inbox, and move any new (unknown) senders to **--Screen** label.

**Notes:**
* You can also manually add / change / remove allowed senders directly in the Spreadsheet database (see below)
* You can change the timing of the triggers in https://script.google.com/home/triggers
* This script does _never_ delete any emails, it just move emails from your inbox and uses labels to filter allowed, disallowed and unknown senders. The script runs only within your google account, there are no servers etc. No data or information is shared outside your own account. The source code is provided on this page. <i>However</i> due to lack of granularity in the Gmail & App authorization scopes, the script does  not work with less priviledges than the ones asked for.

### Starting tips - The Database
To get started, it can be good to add your organisations email domain (and close collaborator organisations domains) to Allowed senders directly, to save some time in screening emails. You can do that by adding a row in the Allowed senders sheet of the Database spreadsheet, with the content "@yourdomain.com" (see image below). Then all email senders from that domain will be allowed, and come directly to your inbox. It works the same for the Disallowed senders tab.

The list is stored in the Database Spreadsheet, which is created once you load the Setup page, and is found here:
* Link on the Setup page of this web app, or
* Search on https://drive.google.com/drive/ for "GIC - Gmail Inbox Control".

* ![image](https://github.com/mackeian/gic/assets/789341/76370c56-875b-49cc-9485-39fd7d73b1b7)

## How do I install it?

### Option 1: Install by URL

* Go to the Web app page: https://script.google.com/macros/s/AKfycbwky7qxPFSVZM0bSkDGHZk4Vq2IdRWR91jVvQwdz1oNXl6U8oD2i0rseUxeYzyQQPzAMA/exec
* Approve the scopes and install the app
* After successfully approved, the web app page will show the installation status and you are ready to go!

### Option 2: Install manually
* Create a Google App script on your own in your organisation (https://script.google.com/home)
* Create a new project, and paste the code from this repo (Code.js and index.html).
* Then run the app, by creating a deployment of it ([Deployments doc](https://developers.google.com/apps-script/concepts/deployments))
* Lastly: Go to the web app url (visible in the Deployment option in Google Scripts) - that will initialise all functionality.

## Troubleshooting
### Installation checks
Have a look at the setup page of the web app, as it automatically tries to create all labels, triggers and the database spreadsheet when it loads (if they do not already exist), and also shows the status of them.
![Screenshot 2023-07-22 at 10 06 28](https://github.com/mackeian/gic/assets/789341/6c4f98ac-233b-4853-900a-7ddc711abbe4)


### Try manually
You can run the triggers manually if you have troubles, just go to the Setup page of this web app where there are test buttons or find the Triggers yourself (https://script.google.com/home/triggers).

### Nothing happens / Unallowed emails stays in the inbox
Note that the triggers are scheduled every 10 mins as a default, this means that for up to 10 mins emails can be in your inbox until they are moved. You can change the periodicity of the triggers if you want this to run more often.

You can also look at the logs of the 3 Triggers (https://script.google.com/home/triggers), to see if there are any errors there.
![Screenshot 2023-07-22 at 10 09 53](https://github.com/mackeian/gic/assets/789341/286c278b-ba85-45b1-bf25-d9e43e4f28ed)

### Error emails
Sometimes the scripts might fail, for different reasons (API's doesn't respond, trouble with the connection etc). Since the scripts run periodically and very frequent, this is not a big issue if it happens once or twice. You can see all errors in the logs and also change the error emails recevied by the application in Triggers:
![Screenshot 2023-07-22 at 10 11 39](https://github.com/mackeian/gic/assets/789341/3bcc215f-549b-4371-adc9-8ef8abda92f5)


### Knows issues
There are some known issues:
* **Multiple entries with same address**: When adding **--Allow** to multiple screening emails at the same time, it causes multiple entries in the Spreadsheet database. This is not a functional issue per see, but looks confusing.

  
### Uninstall
To uninstall the app, go to your Connections (https://myaccount.google.com/connections), find "GIC - Google Inbox Control", and remove it and all access for it.

# Feedback, thoughts & improvements
Feel free to submit a PR or send me an email if you have any questions, feedback or thoughts of improvement.
