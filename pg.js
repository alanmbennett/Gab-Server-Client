
const chalk = require('chalk');
const styling = require('./styling.json');

function applyStyles(str)
{ 
    styling.styles.forEach((elem) => {
        let allMatches = str.match(elem.expression);
        if(allMatches !== null)
        {
            switch(elem.style)
            {
                case 'bold':
                    break;
                case 'italic':
                    allMatches.forEach((match) => {
                        str = str.replace(new RegExp(match,'g'), chalk.italic(match));
                    });
                    break;
                default: 
            }  
        }
    });
    
    return str;
}

console.log(applyStyles("gold"));