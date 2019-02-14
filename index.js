/* From NPM */
const WebSocket = require('ws');
const moment = require('moment');
const fs = require('fs');
const styling = require('./styling.json');

/* My modules */
const Poll = require('./poll.js');
const UI = require('./ui.js');

let username;
let defaultPath = `ws://localhost:4930`;
let actualPath = defaultPath; 
let lastMessage;
let myPoll = null;
let reprintPollRegex = /\\reprintPoll/;

function createMsg(kindStr, dataStr, toStr = 'all')
{
    let obj = 
    {
        from: username,
        to: toStr,
        kind: kindStr,
        data: dataStr  
    };
    
    return obj;
}

function printMsg(jsonMsg)
{
    let styledData = applyStyles(jsonMsg.data);
    
    if(jsonMsg.kind === 'direct')
    {    
        UI.chatbox.pushLine(`{green-fg}[${moment().format('h:mm a')}] [DM from ${jsonMsg.from} to ${jsonMsg.to}]: ${styledData} {/green-fg}`);
    }
    else if(jsonMsg.kind === 'error')
    {
        UI.chatbox.pushLine(`{red-fg}SERVER ERROR: ${jsonMsg.data}{/red-fg}`);         
    }
    else if(jsonMsg.from === 'GABServer' || jsonMsg.kind === 'server')
    {
        UI.chatbox.pushLine(`{yellow-fg}SERVER MSG: ${jsonMsg.data}{/yellow-fg}`);
    }
    else 
    {
        UI.chatbox.pushLine(`[${moment().format('h:mm a')}] ${jsonMsg.from}: ${styledData} `);
    }
    
    UI.chatbox.setScrollPerc(100);
    UI.mainScreen.render();
}

function applyStyles(str)
{ 
    styling.styles.forEach((elem) => 
    {
        let allMatches = str.match(elem.expression);
        if(allMatches !== null)
        {
            switch(elem.style)
            {
                case 'bold':
                    allMatches.forEach((match) => {
                        str = str.replace(new RegExp(match,'g'), `{bold}${match}{/bold}`);
                    });
                    break;
                case 'underline':
                    allMatches.forEach((match) => {
                        str = str.replace(new RegExp(match,'g'), `{underline}${match}{/underline}`);
                    });
                    break;
                case 'italic':
                case 'italics':
                    break;
                case 'blink':
                    allMatches.forEach((match) => {
                        str = str.replace(new RegExp(match,'g'), `{blink}${match}{/blink}`);
                    });
                    break;
                case 'inverse':
                    allMatches.forEach((match) => {
                        str = str.replace(new RegExp(match,'g'), `{inverse}${match}{/inverse}`);
                    });
                    break;
                default: // assumes it is a color
                    allMatches.forEach((match) => {
                        str = str.replace(new RegExp(match,'g'), `{${elem.style}-fg}${match}{/}`);
                    });
            }  
        }
    });
    
    return str;
}

function sendMsg(conn, msg)
{
    let whisperRegex = /\\w ([a-zA-Z0-9]{0,10}) .+/;
    let userlistRegex = /\\userlist/;
    let whoamiRegex = /\\whoami/;
    let addStyleRegex = /\\addStyle (.+) (.+)/;
    let deleteStyleRegex = /\\rmStyle (.+)/;
    let makePollRegex = /\\mkPoll (.+)/;
    let add2PollRegex = /\\add2Poll (.+)/;
    let openPollRegex = /\\openPoll/;
    let closePollRegex = /\\closePoll/;
    
    if(msg && msg.length !== 0)
    {
        if(whisperRegex.test(msg))
        {
            let data = msg.replace(/(\\w [a-zA-Z0-9]{0,10}) /, '');
            let to = msg.split(/\\w ([a-zA-Z0-9]{0,10}) .+/);
            conn.send(JSON.stringify(createMsg('direct', data, to[1])));
            printMsg(createMsg('direct', data, to[1]));
        }
        else if(userlistRegex.test(msg))
        {
             conn.send(JSON.stringify(createMsg('userlist', '', '')));
             printMsg(createMsg('chat', msg));
        }
        else if(whoamiRegex.test(msg))
        {
             conn.send(JSON.stringify(createMsg('whoami', '', '')));
             printMsg(createMsg('chat', msg));
        }
        else if(addStyleRegex.test(msg.trim()))
        {
            let styleArr = msg.trim().split(addStyleRegex);
            if(styleArr[2] !== 'italic' && styleArr[2] !== 'italics')
            {
                let found = -1;
                
                for(let i = 0; i < styling.styles.length; i++)
                {
                    if(styling.styles[i].expression === styleArr[1])
                    {
                        found = i;
                    }     
                }
            
                if(found === -1)
                {
                    styling.styles.push({"expression": styleArr[1], "style": styleArr[2]});
                    saveStyles();
                    printMsg(createMsg('server', 'Style successfully saved'));
                }
                else
                {
                    styling.styles[found] = {"expression": styleArr[1], "style": styleArr[2]};
                    saveStyles();
                    printMsg(createMsg('server', 'Existing style successfully overwritten'));
                }
            }
            else
            {
                printMsg(createMsg('error', 'No support for italics on this client.'));
            }
        }
        else if(deleteStyleRegex.test(msg))
        {
            let styleArr = msg.split(deleteStyleRegex);
            let found = -1;
            
            for(let i = 0; i < styling.styles.length; i++)
            {
                if(styling.styles[i].expression === styleArr[1])
                {
                    found = i;
                }     
            } 
            
            if(found !== -1)
            {
                styling.styles.splice(found, 1);
                saveStyles();
                printMsg(createMsg('server', 'Style successfully deleted'));
            }
        }
        else if(makePollRegex.test(msg))
        {
            let arr = msg.split(makePollRegex);
            
            myPoll = new Poll(arr[1]);
            
            printMsg(createMsg('server', 'New poll started! Now add some answers and open it to the chatroom.'));
        }
        else if(add2PollRegex.test(msg))
        {
            if(myPoll === null)
            {
                printMsg(createMsg('server', `Adding to poll failed! You haven't created a poll yet!! Create one with \\mkPoll QUESTION`));
            }
            else if(!myPoll.getOpen)
            {
                let arr = msg.split(add2PollRegex);
            
                myPoll.addAnswer(arr[1]);
            
                printMsg(createMsg('server', `Answer added to poll "${myPoll.getQuestion}"`));
            }
            else
            {
                printMsg(createMsg('server', `Your poll is open for voting, you cannot add any more answers to it. Please close it first with \\closePoll`)); 
            }
        }
        else if(openPollRegex.test(msg))
        {
            if(myPoll === null)
            {
                printMsg(createMsg('server', `Opening poll failed! You haven't created a poll yet!! Create one with \\mkPoll QUESTION`));
            }
            else if(myPoll.enoughAnswers())
            {
                let instr = `To vote on it, type \\pollAns# (where # is the number of your answer) in the chat or whisper it to ${username}.\n`;
                myPoll.setOpen(true);
                conn.send(JSON.stringify(createMsg('chat', `[AUTOMATED MSG] ${username} has created a poll!:\n\n${myPoll.toString()}\n${instr}\n`)));
            } 
            else 
            {
                printMsg(createMsg('server', `Opening poll failed! You need at least 2 answers to open your poll to the public. Add some with \\add2Poll ANSWER`));
            }
        }
        else if(closePollRegex.test(msg))
        {
            if(myPoll === null)
            {
                printMsg(createMsg('server', `Closing poll failed! You haven't created a poll yet!! Create one with \\mkPoll QUESTION`));
            }
            else if(myPoll.getOpen)
            {
                myPoll.setOpen(false);
                conn.send(JSON.stringify(createMsg('chat', `[AUTOMATED MSG] ${username} has closed their poll!\n\n${myPoll.results()}`)));
            } 
            else
            {
                printMsg(createMsg('server', `Your poll "${myPoll.getQuestion}" is already closed.`));
            }
        }
        else
        {
            conn.send(JSON.stringify(createMsg('chat', msg)));
        }
    }
}

function addUsers(obj)
{
    let users = obj.data.split(',');
    UI.userListBox.setContent(''); 
    users.forEach((elem) => {
        if(elem !== username)
            UI.userListBox.pushLine(elem);
    });
    UI.mainScreen.render();
}

function makeConnection()
{
    const connection = new WebSocket(`${actualPath}/?username=${username}`);
    let sysUserlistCall = false;
    UI.userBox.setContent(`Logged in as ${username} `);
    let errorMsg;
    let errEvent = false;
    
    UI.mainScreen.append(chatbox);
    UI.mainScreen.append(msgInputBox);
    UI.mainScreen.append(enterButton);
    UI.mainScreen.append(userBox);
    UI.mainScreen.append(userListBox);
    UI.mainScreen.append(commandBox);
    UI.mainScreen.append(logoutButton);
    UI.mainScreen.title = `Chatroom connection: ${actualPath}`;
    UI.mainScreen.render();
    
    connection.onclose = () => 
    {
        if(lastMessage !== undefined && lastMessage.kind === 'error' && !errEvent)
            errorMsg = `${lastMessage.data}\n\n\nClick anywhere or press any key to end program.`;
        else if(!errEvent)
            errorMsg = `Server has terminated connection for unspecified reason.\n\n\nClick anywhere or press any key to end program.`;
        UI.enterButton.hide();
        UI.msgInputBox.hide();
        UI.mainScreen.append(terminatedMessage);
        
        terminatedMessage.error(errorMsg, 0, endApp);
    };
    
    connection.onerror = () =>
    {
        errEvent = true;
        errorMsg = 'Invalid connection.\n\n\nClick anywhere or press any key to end program.';
    }
    
    connection.onopen = () =>
    {    
        UI.msgInputBox.focus();
        
        UI.enterButton.on('press', function() {
           let input = UI.msgInputBox.getValue();
           UI.msgInputBox.clearValue();
           sendMsg(connection, input);
        });
        
        UI.msgInputBox.key(['enter'], function(ch, key)  {
            let input = UI.msgInputBox.getValue();
            UI.msgInputBox.clearValue();
            sendMsg(connection, input);
            UI.msgInputBox.focus();
        });   
    } 
    
    connection.onmessage = msg => 
    { 
        let serverJSON = JSON.parse(msg.data);
        lastMessage = serverJSON;
        let pollAnsRegex = /^\\pollAns([0-9]+)$/;
        
        switch(serverJSON.kind)
        {
            case 'userlist':
                addUsers(serverJSON);
                sysUserlistCall = false; 
                break;
            case 'connection':
                printMsg(serverJSON);
                sysUserlistCall = true;
                connection.send(JSON.stringify(createMsg('userlist', "", "")));
                break;
            default:
                if(pollAnsRegex.test(serverJSON.data) && serverJSON.from != username)
                {
                    if(myPoll === null)
                    {   
                    }
                    else if(!myPoll.getOpen)
                    {
                        connection.send(JSON.stringify(createMsg('direct', '[AUTOMATED MSG] Poll is not open for voting at this time.', serverJSON.from))); 
                    }
                    else if(myPoll.alreadyVoted(serverJSON.from))
                    {
                         connection.send(JSON.stringify(createMsg('direct', '[AUTOMATED MSG] You have already voted in this poll.', serverJSON.from)));   
                    }
                    else
                    {
                        let ans = serverJSON.data.split(pollAnsRegex);
                        if(myPoll.validAnswer(parseInt(ans[1])))
                        {
                           myPoll.addVote(parseInt(ans[1]), serverJSON.from);
                           connection.send(JSON.stringify(createMsg('direct', `[AUTOMATED MSG] Thanks for your answer, ${serverJSON.from}! The results of the poll will be made public once ${username} closes it so stay tuned.`, serverJSON.from))); 
                           printMsg(serverJSON);
                        }
                        else
                        {
                            connection.send(JSON.stringify(createMsg('direct', `[AUTOMATED MSG] Error: Invalid answer.`, serverJSON.from))); 
                        }   
                    }
                }
                else 
                {
                    printMsg(serverJSON);
                }
        }
    };
    
}

function saveStyles()
{
    try
    {
        fs.writeFileSync('./styling.json', JSON.stringify(styling));
    }
    catch(err)
    {
        printMsg(createMsg('error', err.message))
    }
}

function endApp()
{
    return process.exit(0);
}

function getUsername (callback)
{
    usernameRegex = /^[A-Za-z0-9]{3,10}$/;
    UI.mainScreen.append(usernameForm);
    UI.pathField.setValue(defaultPath);
    UI.usernameField.clearValue();
    UI.mainScreen.title = 'Chatroom client login';
    UI.mainScreen.render();
    
    UI.usernameField.focus();
    
    UI.usernameField.on('press', function(ch, key) {
        usernameField.focus();
    });
    
    UI.usernameField.on('keypress', function(ch, key)
    {   
        if(usernameRegex.test(UI.usernameField.getValue()))
        {
            errText.hide();
            UI.usernameField.style.bg = '';
        }
        else
        {
            errText.show();
            UI.usernameField.style.bg = 'red';
        }
        
    });
    
    UI.usernameField.key(['enter'], function(ch, key)  {
            UI.pathField.focus();
    }); 
    
    UI.pathField.on('press', function(ch, key) {
            UI.pathField.focus();
    });
    
    UI.pathField.key(['enter'], function(ch, key)  {
            UI.submitButton.focus();
    }); 
    
    UI.cancelButton.on('press', function() {
            endApp();
    });
    
    UI.submitButton.on('press', function() {
        
        if(usernameRegex.test(UI.usernameField.getValue()))
        {
            errText.hide();
            UI.usernameField.style.bg = '';
            username = UI.usernameField.getValue();
            actualPath = UI.pathField.getValue();
        
            UI.mainScreen.remove(usernameForm);
            

            callback();
        }
        else
        {
            errText.show();
            UI.usernameField.style.bg = 'red';
        }
    });
    
}

// Quit on Escape, q, or Control-C.
UI.mainScreen.key(['escape', 'q', 'C-c'], function(ch, key) 
{
    endApp();
});

UI.logoutButton.on('press', function() {
    endApp();
});

getUsername(makeConnection);

