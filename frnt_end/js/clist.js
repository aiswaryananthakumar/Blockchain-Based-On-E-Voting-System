$(document).ready(function() {
    $('.modal').modal();

    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    var abi = JSON.parse('[{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"voteForCandidate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"votesReceived","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"contractOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"candidateNames","type":"bytes32[]"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]');

    var contractAddress = '0xea148b48391c218f971a752f3d3441b773aeb126'; 
    
    var VotingContract = new web3.eth.Contract(abi, contractAddress);

    var accounts = [];
    web3.eth.getAccounts().then(function(accs) {
        if (accs.length === 0) {
            alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
            return;
        }
        accounts = accs;
        console.log("Available accounts: ", accounts);
    }).catch(function(err) {
        alert("There was an error fetching your accounts.");
    });

    var wallet_list = {
        "300000000000": "Akola",
        "738253790005": "Bhandara"
    };

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    var wallet = readCookie('wallet');
    var address = wallet_list[wallet];
    $('#loc_info').text('Location based on wallet: ' + (address || 'Unknown'));

    function disableVoting() {
        $('#vote1, #vote2, #vote3, #vote4').addClass("disabled");
        document.cookie = "show=John Doe; expires=Thu, 18 Dec 2013 12:00:00 UTC";
        document.cookie = "wallet=John Doe; expires=Thu, 18 Dec 2013 12:00:00 UTC";
        window.location = '/app';
    }

    function voteForCandidate(candidate) {
        VotingContract.methods.voteForCandidate(web3.utils.asciiToHex(candidate))
            .send({ from: accounts[0] })
            .then(function(result) {
                alert(`Vote submitted to ${candidate}. Transaction ID: ` + result.transactionHash);
                disableVoting();
                $('#loc_info').text(`Vote submitted successfully to ${candidate}`);
            })
            .catch(function(error) {
                alert('Error in transaction: ' + error);
            });
    }

    $('#vote1').click(function() { voteForCandidate('Sanat'); });
    $('#vote2').click(function() { voteForCandidate('Aniket'); });
    $('#vote3').click(function() { voteForCandidate('Mandar'); });
    $('#vote4').click(function() { voteForCandidate('Akshay'); });
});
