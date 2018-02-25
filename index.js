const rp = require('request-promise');
const Table = require('cli-table');
const cheerio = require('cheerio');

let users = [];

let table =  new Table({
    head : ['username',':heart:','challenges'],
    colWidths : [25,25,20]
})

const options = {
    url : `https://forum.freecodecamp.org/directory_items?period=all&order=likes_received&_=1519561577444`,
    json : true
}

rp(options)
    .then((data) =>{
        let userData = [];
        for(let item of data.directory_items){
            userData.push({name : item.user.username,likes_received : item.likes_received});
        }
        getChallengeCompletedData(userData);
    })
    .catch((err) => {
        console.log(err);
    })

function getChallengeCompletedData(userData){
    var  i = 0;
    function next(){
        if( i < userData.length){
            var options = {
                url : `https://www.freecodecamp.org/` + userData[i].name,
                transform : body => cheerio.load(body)
            }
            rp(options)
                .then(function($){
                    process.stdout.write(`.`);
                    const fccAcount = $('h1.landing-heading').length == 0;
                    // tbody -> tr so counting number of rows in challenges passed
                    const challengesPassed = fccAcount ? $('tbody tr').length : 'unknown';
                    table.push([userData[i].name,userData[i].likes_received,challengesPassed]);
                    ++i;
                    return next();
                })
        }
        else{
            printData();
        }
    }
   return next();
}

function printData(){
    console.log('success');
    console.log(table.toString())
}
