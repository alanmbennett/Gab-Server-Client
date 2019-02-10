const WebSocket = require('ws');
const blessed = require('blessed');
const moment = require('moment');

let username;
let defaultPath = `ws://localhost:4930`;
let actualPath = defaultPath; 
let lastMessage;

// Screen objects
let mainScreen = blessed.screen({
    smartCSR: true
});

// background gif

let background = blessed.image(
{
    file: './rainbow-2.gif',
    type: 'ansi',
    animate: true,
    top: 0,
    left: 0,
    height: 'shrink',
    width: 'shrink',
    scale: 1.0,
    optimization: 'mem'
});


/* User login screen */
let usernameForm = blessed.form(
{
    top: 'center',
    left: 'center',
    width: '50%',
    height: '50%', 
    content: 'Input a username and connection: ',
    style: {
        fg: 'white',
        border: {
            fg: '#ffffff',
        }
    }
});

let usernameText = blessed.Text(
{
    parent: usernameForm,
    top: '15%',
    left: 0,
    content: 'Username'   
});

let connectionText = blessed.Text({
    parent: usernameForm,
    top: '35%',
    left: 0,
    content: 'Connection'
});

let usernameField = blessed.textbox(
{
    parent: usernameForm, 
    top: '10%',
    left: '20%',
    width: '60%',
    height: '15%', 
    border: {
        type: 'line'
    },
    inputOnFocus: true,
    keys: true,
    mouse: true,
    style: {
        fg: 'white',
        border: {
            fg: '#ffffff'
        }
    }
});

let pathField = blessed.textbox(
{
    parent: usernameForm, 
    top: '30%',
    left: '25%',
    width: '60%',
    height: '15%', 
    border: {
        type: 'line'
    },
    inputOnFocus: true,
    keys: true,
    mouse: true,
    style: {
        fg: 'white',
        border: {
            fg: '#ffffff'
        }
    }
});

let submitButton = blessed.button({
    parent: usernameForm,
    top: '50%',
    left: '40%',
    width: '30%',
    height: '15%',
    border: {
        type: 'line'
    },
    content: 'Connect',
    align: 'center',
    mouse: true,
    style: {
        fg: 'white',
        bg: 'green',
        border: {
            fg: '#ffffff',
        },
        hover: {
            bg: 'red'
        }
    }
});

let cancelButton = blessed.button({
    parent: usernameForm,
    top: '50%',
    left: 0,
    width: '30%',
    height: '15%',
    border: {
        type: 'line'
    },
    content: 'Cancel',
    align: 'center',
    mouse: true,
    style: {
        fg: 'white',
        bg: 'green',
        border: {
            fg: '#ffffff',
        },
        hover: {
            bg: 'red'
        }
    }
});

/* Chat screen */

let chatbox = blessed.box(
{
  top: 'left',
  width: '70%',
  height: '90%',
  alwaysScroll:true,
  scrollable: true,
  mouse: true,
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    transparent: true,
    border: {
      fg: '#ffffff'
    }
  }
});

let userBox = blessed.box (
{
    top: 'right',
    right: 0,
    width: '30%',
    height: '15%',
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        transparent: true,
        border: {
        fg: '#ffffff'
        }
  }
});

let userListBox = blessed.box (
{
    top: '15%',
    right: 0,
    width: '30%',
    height: '40%',
    scrollable: true, 
    content: 'Users in the Chat: ',
    border: {
        type: 'line'
    },
   style: {
    fg: 'white',
    transparent: true,
    border: {
      fg: '#ffffff'
    }
  }
});

let commandBox = blessed.box (
{
    top: '54%',
    right: 0,
    width: '30%',
    height: '35%',
    scrollable: true, 
    content: 'Commands:\n Whisper/DM: \\w USERNAME MESSAGE \n Get user list: \\userlist \n Check username: \\whoami ',
    border: {
        type: 'line'
    },
   style: {
    fg: 'white',
    transparent: true,
    border: {
      fg: '#ffffff'
    }
  }
});

let terminatedMessage = blessed.message (
{
    top: 'center',
    left: 'center',
    width: '50%',
    height: '50%', 
    border: {
        type: 'line'
    },
    keys: true,
    mouse: true,
    style: {
        fg: 'white',
        border: {
            fg: '#ffffff'
        }
    }
});

let msgInputBox = blessed.textbox(
{
    bottom: 0,
    width: '60%',
    height: '10%', 
    border: {
        type: 'line'
    },
    keys: true,
    mouse: true,
    inputOnFocus: true,
    style: {
        fg: 'white',
        border: {
            fg: '#ffffff'
        }
    }
});

let enterButton = blessed.button(
{
    bottom: 0,
    left: '60%',
    width: '10%',
    height: '10%',
    border: {
        type: 'line'
    },
    content: 'Send',
    align: 'center',
    mouse: true,
    style: {
        fg: 'white',
        bg: 'green',
        border: {
            fg: '#ffffff',
        },
        hover: {
            bg: 'red'
        }
    }
});

let logoutButton = blessed.button(
{
    bottom: 0,
    right: 0,
    content: 'Logout',  
    width: '20%',
    height: '10%',
    border: {
        type: 'line'
    },
    align: 'center',
    mouse: true,
    style: {
        fg: 'white',
        bg: 'green',
        border: {
            fg: '#ffffff',
        },
        hover: {
            bg: 'red'
        }
    }
});

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
    if(jsonMsg.kind === 'direct')
        chatbox.pushLine(`[${moment().format('h:mm a')}] [DM from ${jsonMsg.from} to ${jsonMsg.to}]: ${jsonMsg.data} `);
    else 
    {
        chatbox.pushLine(`[${moment().format('h:mm a')}] ${jsonMsg.from}: ${jsonMsg.data} `);
    }
    
    chatbox.setScrollPerc(100);
    mainScreen.render();
}

function sendMsg(conn, msg)
{
    let whisperRegex = /\\w ([a-zA-Z0-9]{0,10}) .+/;
    let userlistRegex = /\\userlist/;
    let whoamiRegex = /\\whoami/;
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
        else
        {
            conn.send(JSON.stringify(createMsg('chat', msg)));
        }
    }
}

function addUsers(obj)
{
    let users = obj.data.split(',');
    userListBox.setContent(''); 
    userListBox.pushLine('Users in the Chat: ');
    users.forEach((elem) => {
        userListBox.pushLine(elem + ' ');
    });
    mainScreen.render();
}


function printJSON(obj)
{
    chatbox.pushLine(obj);
    mainScreen.render();
}


function makeConnection()
{
    const connection = new WebSocket(`${actualPath}/?username=${username}`);
    let sysUserlistCall = false;
    userBox.setContent(`Logged in as ${username} `);
    
    mainScreen.append(chatbox);
    mainScreen.append(msgInputBox);
    mainScreen.append(enterButton);
    mainScreen.append(userBox);
    mainScreen.append(userListBox);
    mainScreen.append(commandBox);
    mainScreen.append(logoutButton);
    mainScreen.title = `Chatroom connection: ${actualPath}`;
    mainScreen.render();
    
    connection.onclose = () => 
    {
        let errorMsg = `${lastMessage.data}\n\n\nPress click anywhere to end program.`;
        enterButton.hide();
        msgInputBox.hide();
        mainScreen.append(terminatedMessage);
        
        terminatedMessage.error(errorMsg, 0, restart);
    };
    
    connection.onopen = () =>
    {    
        msgInputBox.focus();
        
        enterButton.on('press', function() {
           sendMsg(connection, msgInputBox.getValue());
           msgInputBox.clearValue();
        });
        
        msgInputBox.key(['enter'], function(ch, key)  {
            sendMsg(connection, msgInputBox.getValue());
            msgInputBox.clearValue();
            msgInputBox.focus();
        });   
    } 
    
    connection.onmessage = msg => 
    { 
        //let serverStr = msg.data;
        let serverJSON = JSON.parse(msg.data);
        lastMessage = serverJSON;
        
        switch(serverJSON.kind)
        {
            case 'userlist':
                if(!sysUserlistCall)
                    printMsg(serverJSON);
                else
                {
                    addUsers(serverJSON);
                    sysUserlistCall = false; 
                }
                break;
            case 'connection':
                printMsg(serverJSON);
                sysUserlistCall = true;
                connection.send(JSON.stringify(createMsg('userlist', "", "")));
                break;
            default:
                printMsg(serverJSON);
        }
    };
    
}

function restart()
{
    return process.exit(0);
    /*
    mainScreen.remove(terminatedMessage);
    mainScreen.remove(chatbox);
    mainScreen.remove(msgInputBox);
    mainScreen.remove(enterButton);
    mainScreen.remove(userBox);
    mainScreen.remove(userListBox);
    mainScreen.remove(logoutButton);
    
    getUsername(makeConnection);*/
}

function getUsername (callback)
{
    mainScreen.append(background);
    mainScreen.append(usernameForm);
    pathField.setValue(defaultPath);
    usernameField.clearValue();
    mainScreen.title = 'Chatroom client login';
    mainScreen.render();
    
    usernameField.focus();
    
    usernameField.on('press', function(ch, key) {
        usernameField.focus();
    });
    
    usernameField.key(['enter'], function(ch, key)  {
            pathField.focus();
    }); 
    
    pathField.on('press', function(ch, key) {
        pathField.focus();
    });
    
    pathField.key(['enter'], function(ch, key)  {
            submitButton.focus();
    }); 
    
    cancelButton.on('press', function() {
        return process.exit(0);
    });
    
    submitButton.on('press', function() {
        username = usernameField.getValue();
        actualPath = pathField.getValue();
        
        mainScreen.remove(usernameForm);

        callback();
    });
    
}

// Quit on Escape, q, or Control-C.
mainScreen.key(['escape', 'q', 'C-c'], function(ch, key) 
{
  return process.exit(0);
});

logoutButton.on('press', function() {
    return process.exit(0);
});

getUsername(makeConnection);

