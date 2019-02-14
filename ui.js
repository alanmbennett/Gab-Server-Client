

// Screen objects
let mainScreen = blessed.screen({
    smartCSR: true
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

let errText = blessed.Text({
    parent: usernameForm,
    hidden: true,
    top: '75%',
    left: 0,
    content: 'Error: Username must be alphanumeric ranging from 3 to 10 characters. ',
    style: {
        fg: 'red',
    }
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
        },
        focus: {
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
        },
        focus: {
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
  label: 'Chatroom',
  mouse: true,
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    border: {
      fg: '#ffffff'
    },
    scrollbar: {
        bg: 'green'
    }
  }
});

let userBox = blessed.box (
{
    top: 'right',
    right: 0,
    label: 'User Info',
    width: '30%',
    height: '15%',
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
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
    label: 'Other Users in the Chat',
    border: {
        type: 'line'
    },
   style: {
    fg: 'white',
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
    label:'Commands',
    content: ' Whisper/DM: \\w USERNAME MESSAGE \n Check username: \\whoami \n Add style: \\addStyle REGEX STYLE \n Delete style: \\rmStyle REGEX\n Make a poll: \\mkPoll QUESTION\n Add Answer to Poll: \\add2Poll ANSWER\n Open poll: \\openPoll\n Close poll: \\closePoll',
    border: {
        type: 'line'
    },
   style: {
    fg: 'white',
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