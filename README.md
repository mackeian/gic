# GIC - Gmail Inbox Control
## Purpose of the app

The purpose of this web app, is to ensure that only email senders you have explicitly approved, ends up in your Gmail Inbox. All other email senders ends up in a Screening (label) in Gmail, which you can screen at a time that suits you, and then approve or decline new senders. It puts you in control of your Inbox. Or as Basecamp call it, your Imbox (Important Inbox).

**Note:** This script does _never_ delete any emails, it just move emails from your inbox and uses labels to filter allowed, disallowed and unknown senders. The script runs only within your google account, there are no servers etc. No data or information is shared outside your own account. The source code is provided on this page.
However: The Gmail & App scopes, does unfortunately allow for less priviledges than acquired.

**Credit:** It was technically inspired from https://github.com/PlanetEfficacy/gmailFilter, and wise idea wise taken from Hey's Imbox functionality https://www.hey.com/features/the-imbox/. Thanks for giving me the inspiration to proceed with this project!

## How do I use it?
1. All new emails will be moved from your Inbox into the "--Screen" label
1. In the "--Screen" label, you can choose to Allow or Disallow the sender of that email to arrive in your inbox next time.


### Screening - Allowing a sender
1. Go to "--Screen" label
1. Select one or multiple emails
1. Add the label "--Allow" to the selected emails
1. From now on, the senders will end up in your Inbox directly, and not go to screening.

<em>Optionally: You can also select "Move to: Inbox" if you want to look at this email.</em>


-- image



### Screening - Disallowing a sender
1. Go to "--Screen" label
2. Select one or multiple emails
3. Add the label "--Disallow" to the selected emails
4. From now on, the senders will **not** end up in your Inbox, but be archived directly once received.

### Technically: How does it work ?
By labelling the email with "--Allow", a Trigger script runs periodically (every 10 mins) and add the email address of the labelled emails to a list of Allowed senders (in the Spreadsheet database). This list is then used to scan your Inbox periodically (also every 10 mins) and keep those emails in your inbox. The list is stored in the Database Spreadsheet, which can be found in on this page.

<em>Note: You can also manually add / change / remove allowed senders directly in the Spreadsheet database.</em>

### Starting tips
To get started, it can be good to add your organisations email domain (and close collaborator organisations domains) to Allowed senders directly, to save some time in screening emails. You can do that by adding a row in the Allowed senders sheet of the Database spreadsheet, with the content "@yourdomain.com". Then all email senders from that domain will be allowed, and come directly to your inbox.


## Why did I write this app?
I was constantly annoyed by random people cold emailing me, filling up my inbox and making it hard to be on top of it without being distracted by unknown (non-urgent) senders' emails. With this solution, I still can review random people email (because sometimes I want to). But, by default I have to approve them before they start showing up in my inbox. And I can choose _when_ I review them, like in the end of the day when I have more time or even once a week if I'm feeling extra casual:) It's like with people in general, I don't let random strangers right into my living room.
