module.exports = class Poll 
{
    constructor(question)
    {
        this.question = question;
        this.answers = [];
        this.open = false;
        this.voters = [];
    }
    
    addAnswer(answer)
    {
        this.answers.push({text: answer, votes: 0});
    }
    
    enoughAnswers()
    {
        if(this.answers.length >= 2)
        {
            return true; 
        }
        
        return false;
    }
    
    alreadyVoted(voter)
    {
        let found = false;
        
        this.voters.forEach((v) => 
        {
            if(v === voter)
                found = true;
        });
        
        return found;
    }
    
    validAnswer(index)
    {
        if(index < 1 || index > this.answers.length)
            return false;
        
        return true;
    }
    
    addVote(index, voter)
    {
        this.answers[index - 1].votes++;
        this.voters.push(voter);
    }
    
    setOpen(status)
    {
        this.open = status;
    }
    
    get getOpen()
    {
        return this.open;
    }
    
    get getQuestion()
    {
        return this.question;
    }
    
    results()
    {
        let str = `The results of "${this.question}" are:\n\n`
        let count = 1;
        this.answers.forEach((answer) =>
        {
            if(this.voters.length != 0)
            {
                str += `${answer.votes/this.voters.length*100}% (${answer.votes}) voted for ${count} - ${answer.text}\n`;
            }
            else
            {
                str += `${answer.votes}% voted for ${count} - ${answer.text}\n`;
            }
            
            count++;
        });
        
        str += `\nTotal # of voters: ${this.voters.length}\n`;
            
        return str;
    }
    
    toString()
    {
        let str = `${this.question}\n\n`;
        let count = 1;
        
        this.answers.forEach((answer) => 
        {
            str += `${count} - ${answer.text}\n`;
            count++;
        });
        
        return str;
    }
}