# GIC - Gmail Inbox Control
## Purpose of the app

The purpose of this web app, is to **only let email senders you have explicitly approved, end up in your Gmail Inbox**. All other email senders ends up in a Screening (label) in Gmail, which you can screen at a time that suits you, and then approve or decline new senders. It puts you in control of your Inbox. Or as Basecamp call it, your Imbox (Important Inbox). This Google Scripts app was created by myself since I was receiving a lot of irrelevant emails to my professional inbox, and that made it hard for me to stay on top of the relevant emails at work. I wanted a simple solution in Gmail.

**Note:** This script does _never_ delete any emails, it just move emails from your inbox and uses labels to filter allowed, disallowed and unknown senders. The script runs only within your google account, there are no servers etc. No data or information is shared outside your own account. The source code is provided on this page.
However: Due to lack of granularity in the Gmail & App authorization scopes, it does unfortunately not work with less priviledges than asked for.

**Credit:** It was technically inspired from https://github.com/PlanetEfficacy/gmailFilter, and idea wise taken from Hey's Imbox functionality https://www.hey.com/features/the-imbox/. Thanks for giving me the inspiration to proceed with this project!

## How do I install it?

### Option 1 (Simple): Install by URL

* Go to the Web app page: https://script.google.com/macros/s/AKfycbwky7qxPFSVZM0bSkDGHZk4Vq2IdRWR91jVvQwdz1oNXl6U8oD2i0rseUxeYzyQQPzAMA/exec
* Approve the scopes and install the app (need to approve the exception, as this app has not been submitted to Google for review)

<img src="https://github.com/mackeian/gic/assets/789341/bc05e0e5-2d46-48d5-ab39-02b7896939f6" width="400">

<img src="https://github.com/mackeian/gic/assets/789341/30896f68-f932-4001-9879-e6d4db90a36e" width="400">

<img src="https://github.com/mackeian/gic/assets/789341/cc9bd950-79d3-4028-915d-654670aa81fe" width="400">


### Option 2: Create your own
Create a Google App script on your own (https://script.google.com/home), create a new project, and paste the code from this repo. Then run it. Going to the web app url (the Implement option in Google Scripts), will initialise all functionality.

## How do I use it?
1. All new emails will be moved from your Inbox into the *"--Screen"* label.
1. In the *"--Screen"* label view, you can choose to **Allow** or **Disallow** the sender of that email to arrive in your inbox next time.
2. After this step, allowed email senders will stay in your Inbox, Disallowed or New email senders will not appear in your Inbox.

![image](https://github.com/mackeian/gic/assets/789341/0e72e74c-e3f4-4ee5-abf1-2c612b7058f8)


### Screening - How to Allow a sender
1. Go to *"--Screen"* label
1. Select one or multiple emails
1. Add the label *"--Allow"* to the selected emails
1. From now on, the senders will end up in your Inbox directly, and not go to screening.

![Allow](https://github.com/mackeian/gic/assets/789341/e7aaad87-376f-4902-9df5-feeefff4fa6c)

<em>Optionally: You can also select "Move to: Inbox" if you want to look at this email.</em>

### Screening - How to Disallowing a sender
1. Go to *"--Screen"* label
2. Select one or multiple emails
3. Add the label *"--Disallow"* to the selected emails
4. From now on, the senders will **not** end up in your Inbox, but be archived directly once received.

### Technically: How does it work ?
* **Allowing & Disallowing**
  * (Every 10 mins): When you label an email with *"--Allow"* label, a Trigger script runs periodically and adds the email address of the labelled emails to a list of Allowed senders (tab in the Spreadsheet database).
  * (Every 10 mins) The emails you labelled with *"--Disallow"* follows the same pattern, but is instead added to Disallowed senders (tab in the Spreadsheets database).
* **Filtering emails in your Inbox**
  * (Every 10 mins) The spreadsheet database of allowed and disallowed senders, is used to scan your Inbox and
    * 1) Keep emails from allowed senders (mark thenm with label **-Allow**), and
    * 2) Move emails from Disallowed senders out of the inbox, and move any new (unknown) senders to **--Screen** label.

**Notes:**
* You can also manually add / change / remove allowed senders directly in the Spreadsheet database (see below)
* You can change the timing of the triggers in https://script.google.com/home/triggers

### Starting tips - The Database
To get started, it can be good to add your organisations email domain (and close collaborator organisations domains) to Allowed senders directly, to save some time in screening emails. You can do that by adding a row in the Allowed senders sheet of the Database spreadsheet, with the content "@yourdomain.com". Then all email senders from that domain will be allowed, and come directly to your inbox. It works the same for the Disallowed senders tab.

The list is stored in the Database Spreadsheet, which is created once you load the Setup page, and is found here:
* Link on the Setup page of this web app, or
* Search on https://drive.google.com/drive/ for "GIC - Gmail Inbox Control".


![image](https://github.com/mackeian/gic/assets/789341/76370c56-875b-49cc-9485-39fd7d73b1b7)

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
* **Multiple entries with same address**: When adding **--Allow** to multiple screening emails at the same time, causes multiple entries in the Spreadsheet database. This is not a functional issue per see, but looks confusing.

  
### Uninstall
To uninstall the app, go to your Connections (https://myaccount.google.com/connections), find "GIC - Google Inbox Control", and remove it and all access for it.
