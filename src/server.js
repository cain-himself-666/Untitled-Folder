var express = require('express');
var bodyParser = require('body-parser');
const Web3 = require('web3');
const MyContract = require('../build/contracts/SeedCertifi.json');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var User = require('./models/user');
var Admin = require('./models/admin');
const e = require('express');
const { allowedNodeEnvironmentFlags } = require('process');
const { query } = require('express');
const web3 = new Web3('http://localhost:9545');
//User types
//Admin - useraccount = 1
//User - useraccount = 2
//Seed certification authority - SCA - useraccount = 3
//Seed testing lab - STL - useraccount = 4
//Seeding producing agency - SPA - - useraccount = 5

// invoke an instance of express application.
var app = express();

// Set EJS as templating engine
app.set('view engine', 'ejs');

// Public Directory
app.use(express.static(__dirname + '/public'));

// Set our application port
app.set('port', 8000);

// set morgan to log info about our requests for development use.
app.use(morgan('dev'));

// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({ extended: true }));

// initialize cookie-parser to allow us access the cookies stored in the browser. 
app.use(cookieParser());


/*
// Trace Page
app.get('/trace', function (req, res) {
    res.render('seed-track-en');
});
*/

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));


// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});


// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }    
};

// route for normal user signup
app.route('/normalusersignup')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/normalusersignup.html');
    })
    .post((req, res) => {
        User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            usertype: req.body.usertype,
            activated: req.body.activated
        })
        .then(user => {
            req.session.user = user.dataValues;
	        req.session.useraccount = user.usertype;
	        req.session.activated = user.activated;
            res.redirect('/dashboard');
        })
        .catch(error => {
            res.redirect('/normalusersignup');
        });
    });

// route for admin signup
app.route('/adminsignup')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/adminsignup.html');
    })
    .post((req, res) => {
        Admin.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            usertype: req.body.usertype,
            activated: req.body.activated
        })
        .then(admin => {
            req.session.user = admin.dataValues;
            req.session.useraccount = admin.usertype;
            req.session.activated = admin.activated;
            res.redirect('/dashboard');
        })
        .catch(error => {
            res.redirect('/adminsignup');
        });
    });


// route for normal user Login
app.route('/normaluserlogin')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/normaluserlogin.html');
    })
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;

        User.findOne({ where: { username: username } }).then(function (user) {
            if (!user) {
                res.redirect('/normaluserlogin');
            } else if (!user.validPassword(password)) {
                res.redirect('/normaluserlogin');
            } else {
                req.session.user = user.dataValues;
		req.session.useraccount = user.usertype;
		req.session.activated = user.activated;
                res.redirect('/dashboard');
		}
        });
    });

// route for admin Login
app.route('/adminlogin')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/adminlogin.html');
    })
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;

        Admin.findOne({ where: { username: username } }).then(function (admin) {
            if (!admin) {
                res.redirect('/adminlogin');
            } else if (!admin.validPassword(password)) {
                res.redirect('/adminlogin');
            } else {
                req.session.user = admin.dataValues;
		        req.session.useraccount = admin.usertype;
		        req.session.activated = admin.activated;
                res.redirect('/dashboard');
		    }
        });
    });

// route for normal user Login
app.route('/login')
    .get(sessionChecker, (req, res) => {
        //res.sendFile(__dirname + '/public/normaluserlogin.html');
        let lang;
        if (req.cookies.lang === 'hi') {
            lang = 'hi';
        } else {
            lang = 'en';
        }
        if (lang === 'hi') {
            res.render('login-hi');
        } else {
            res.render('login');
        }         
    })
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;
	        //usertype = req.body.usertype,
	        //activated = req.body.activated;

        User.findOne({ where: { username: username } }).then(function (user) {
            if (!user) {
                res.redirect('/login');
            } else if (!user.validPassword(password)) {
                res.redirect('/login');
            } else {
                req.session.user = user.dataValues;
                req.session.useraccount = user.usertype;
                req.session.activated = user.activated;
                res.redirect('/dashboard');
		}
        });
    });

    // ONLY FOR TESTING BY US
app.get('/test', (req, res) => {
    const temp = req.query.name;
    //console.lop
    res.send(temp);
    //res.render('seed-production-agency-en');
    //res.render('seed-certification-authority-en');
});


//home page
app.get('/', function (req, res) {
    let lang;
    if (req.cookies.lang === 'hi') {
        lang = 'hi';
    } else {
        lang = 'en';
    }

    if(req.session.user && req.cookies.user_sid) {
        if (lang === 'hi') {
            res.render('index-loggedin-hi');
        } else {
            res.cookie('lang', 'en', {maxAge: 900000, httpOnly: true});
            res.render('index-loggedin-en');
        } 
    } else {
        if (lang === 'hi') {
            res.render('index-hi');
        } else {
            res.cookie('lang', 'en', {maxAge: 900000, httpOnly: true});
            res.render('index-en');
        }        
    }
    
    
    
    //res.redirect('/normaluserlogin');
});

app.get('/hi', (req, res) => {
    res.cookie('lang', 'hi', {maxAge: 900000, httpOnly: true});
    res.redirect('back');
});

app.get('/en', (req, res) => {
    res.cookie('lang', 'en', {maxAge: 900000, httpOnly: true});
    res.redirect('back');
});

// route for user's dashboard
app.get('/dashboard', (req, res) => {
    let lang;
    if (req.cookies.lang === 'hi') {
        lang = 'hi';
    } else {
        lang = 'en';
    }
    if (req.session.user && req.cookies.user_sid && req.session.useraccount == 1 && req.session.activated == 1) {
        res.sendFile(__dirname + '/public/admindashboard.html');
    } else if(req.session.user && req.cookies.user_sid && req.session.useraccount == 2 && req.session.activated == 1){
        res.sendFile(__dirname + '/public/normaluserdashboard.html');
    }
    // Seed Certification Authority
    else if(req.session.user && req.cookies.user_sid && req.session.useraccount == 3 && req.session.activated == 1){
        //res.sendFile(__dirname + '/public/scadashboard.html');
        if (lang === 'hi') {
            res.render('seed-certification-authority-hi');
        } else {
            res.render('seed-certification-authority-en');
        }
        
    }
    // Seed Testing Lab
    else if(req.session.user && req.cookies.user_sid && req.session.useraccount == 4 && req.session.activated == 1){
        //res.sendFile(__dirname + '/public/stldashboard.html');
        if (lang === 'hi') {
            res.render('seed-testing-lab-hi');
        } else {
            res.render('seed-testing-lab-en');
        }
    } 
    // Seed Production Agency
    else if(req.session.user && req.cookies.user_sid && req.session.useraccount == 5 && req.session.activated == 1){
        //res.sendFile(__dirname + '/public/spadashboard.html');
        if (lang === 'hi') {
            res.render('seed-production-agency-hi');
        } else {
            res.render('seed-production-agency-en');
        }
        
    } else {
        res.redirect('/login');
    }
});

// route for user logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        if (req.session.user && req.cookies.user_sid && req.session.useraccount == 1){
            res.redirect('/adminlogin');
        }
        else if (req.session.user && req.cookies.user_sid && req.session.useraccount == 2){
            res.redirect('/login');
        }
    } 
});

/*
    * Getting the date to the blockchain starts from here
*/

// Submitting the Test Results
app.post('/submit-test-result', async (req, res) => {
    if(req.session.user && req.cookies.user_sid && req.session.useraccount == 4 && req.session.activated == 1){
        const {seedId, secretCode, result} = req.body;
        console.log(seedId, secretCode, result);
        // Some sort of data validation needed here            
        const id = await web3.eth.net.getId();
        const deployedNetwork = MyContract.networks[id];
        const contract = new web3.eth.Contract(
            MyContract.abi,
            deployedNetwork.address
        );
            // query = await contract.methods.seed_test(seedId,""+secretCode,true).send({from: '0xB8AfcE2ea36f01e8D38C96C2B6E6214E57cE0F4C'});
            if(result === "passed"){
                try{
                    const value = true;
                    const query = await contract.methods.seed_test(seedId,""+secretCode,value).send({from: '0xB8AfcE2ea36f01e8D38C96C2B6E6214E57cE0F4C'});
                }
                catch{
                    res.send('Error: Seed Data not available');
                }
            }
            else{
                try{
                    const value = false;
                    const query = await contract.methods.seed_test(seedId,""+secretCode,value).send({from: '0xB8AfcE2ea36f01e8D38C96C2B6E6214E57cE0F4C'});
                }
                catch{
                    res.send('Error: Seed Data not available');
                }
            }

            // Add your fucntion call to smart contract
    }
});

// Submitting the seed certificate
app.post('/submit-seed-certification', async (req, res) => {
    if(req.session.user && req.cookies.user_sid && req.session.useraccount == 3 && req.session.activated == 1){
        const {seedId, certificationNumber, seedLot, certificateBy} = req.body;
        const id = await web3.eth.net.getId();
        const deployedNetwork = MyContract.networks[id];
        const contract = new web3.eth.Contract(
        MyContract.abi,
        deployedNetwork.address
        );
        let query;
        try{
            query = await contract.methods.certification(certificationNumber,certificateBy, seedId, seedLot ).send({from: '0x4eF6DB5bb79f82a50655D565e8BC8dfdA2Fa8517'});
        }
        catch{
            res.send('Data Not Found');
        }
        // Some sort of data validation needed here            
        console.log(req.body);
        // Add your fucntion call to smart contract
        res.send("Success");
    }
});

// Submitting the seed certificate
app.post('/submit-seed-registration', (req, res) => {
    if(req.session.user && req.cookies.user_sid && req.session.useraccount == 5 && req.session.activated == 1){
        const name = req.body.name,
            id = req.body.id,
            location = req.body.location,
            aadhaarNumber = req.body.aadhaarNumber,
            cropType = req.body.cropType,
            sgType = req.body.sgType;
        // Some sort of data validation needed here            
        console.log(req.body);
        // Add your fucntion call to smart contract
        res.send("Success");
    }
});


/*
    * Getting the date from the blockchain
*/

// Get value in the form of query and get and return the value from the block chain
app.get('/trace', async (req, res) => {
    let lang;
    if (req.cookies.lang === 'hi') {
        lang = 'hi';
    } else {
        lang = 'en';
    }

    const seedId = req.query.seedId;
    const id = await web3.eth.net.getId();
    const deployedNetwork = MyContract.networks[id];
    const contract = new web3.eth.Contract(
      MyContract.abi,
      deployedNetwork.address
    );
    let query;
    try{
        query = await contract.methods.viewCert(seedId).send({from: '0x4eb86856c38053Eb7596b4897c8CAF061b465291'});
    }
    catch{
        res.send('Data Not Found');
    }
    // Use seedId or any other id of choice to query into the blockchain
    
    // Get data from the blockchain
    // Remove the below once the block chain development is done and the data is fetched
    try{
        const data = {
            seedlotNumber: ''+query.events.certifi.returnValues.seed_lot,
            certificationDate : '8th October, 2020',
            certificateValidity : ''+query.events.certifi.returnValues.validity,
            certificationAuthority : ''+query.events.certifi.returnValues.cert,
            // Space for link
            testingLab : 'STL',
            dateOfTesting : '8th October, 2020',
            testResult : 'Passed',
            // Space for link
            productionAgency : 'SPA',
            dateOfRegistration: '8th October, 2020'
        }
    }
    catch{
        res.send('Pending to be certified');
    }
    const data = {
        seedlotNumber: ''+query.events.certifi.returnValues.seed_lot,
        certificationDate : '8th October, 2020',
        certificateValidity : ''+query.events.certifi.returnValues.validity,
        certificationAuthority : ''+query.events.certifi.returnValues.cert,
        // Space for link
        testingLab : 'STL',
        dateOfTesting : '8th October, 2020',
        testResult : 'Passed',
        // Space for link
        productionAgency : 'SPA',
        dateOfRegistration: '8th October, 2020'
    }
    
    // Render this page if matching record is found
    if (lang === 'hi') {
        res.render('seed-track-hi', {data:data});
    } else {
        res.render('seed-track-en', {data:data});
    }
    //Else res.send('Coundn't find the seed you are looking for');

});

// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
});

// start the express server
app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));