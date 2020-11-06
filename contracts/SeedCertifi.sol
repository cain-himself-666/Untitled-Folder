pragma solidity ^0.5.9;

contract SeedCertifi {
    
    string sci_name = "Mr. Raja";
    uint sci_id = 1001;
    string init = "Init";
    string duration = "9 months";
    struct Seed {
        uint seed_id;
        uint seed_lot;
        string status;
        bool entry_stat;
        bool stl_test;
    }
    struct Test {
        string code;
        bool test;
        uint date;
    }
    struct Cert{
        uint cert_no;
        string cert_by;
        string validity;
        uint seed_id;
        uint seed_lot;
    }
    address seedGrower;
    address stl;
    address sca;
    address spa;
    event certifi(uint cert_no, string cert, string validity, uint seed_id, uint seed_lot);
    Test[] public test;
    Seed[] public seed;
    Cert[] public cert;
    
    constructor() public {
        sca = msg.sender;
    }
    
    function viewCert(uint seed_id) public {
        require(msg.sender != sca && msg.sender != stl && msg.sender != spa);
        require(cert.length > 0);
        seedGrower = msg.sender;
        for(uint i=0;i<seed.length;i++){
            for(uint j=0;j<cert.length;j++){
                if(seed[i].seed_id == seed_id && cert[j].seed_id == seed_id){
                    emit certifi(cert[i].cert_no, cert[i].cert_by, cert[i].validity, cert[i].seed_id, cert[i].seed_lot);
                }       
            }
        }
    }
    function seed_entry(uint seed_id, uint seed_lot) public {
        require(msg.sender != sca && msg.sender != stl);
        for(uint i=0;i<seed.length;i++){
            require(seed[i].seed_id != seed_id && seed[i].seed_lot != seed_lot);
        }
        spa = msg.sender;
        seed.push(Seed(seed_id, seed_lot, init, true, false)); 
    }
    
    function seed_test(uint id, string memory secret_code, bool result) public {
        require(msg.sender != sca && msg.sender != spa);
        require(seed.length > 0);
        for(uint j=0;j<seed.length;j++){
            if(seed[j].seed_id == id){
                require(seed[j].entry_stat == true);
            }
        }
        stl = msg.sender;
        uint date = block.timestamp;
        if(result){
            test.push(Test(secret_code, result, date));
            for(uint i=0;i<seed.length;i++){
                if(seed[i].seed_id == id){
                    seed[i].status = "Test Successful";
                    seed[i].stl_test = true;
                }
            }    
        }
        else{
            test.push(Test(secret_code, result, date));
            for(uint i=0;i<seed.length;i++){
                if(seed[i].seed_id == id){
                    seed[i].status = "Test Failed";
                    seed[i].stl_test = false;
                }
            }   
        }
    }
    
    function certification(uint cert_no, string memory cert_by, uint id, uint seed_lot) public {
        require(msg.sender != spa && msg.sender !=stl);
        for(uint j=0;j<seed.length;j++){
            if(seed[j].seed_id == id){
                require(seed[j].stl_test == true);
            }
        }
        sca = msg.sender;
        for(uint i=0;i<seed.length;i++){
            if(seed[i].seed_id == id){
                    cert.push(Cert(cert_no, cert_by, duration, id, seed_lot));
            }
        }
    }
        
}
