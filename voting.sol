pragma solidity ^0.4.11;

contract Voting {
    mapping (bytes32 => uint8) public votesReceived;
    bytes32[] public candidateList;

    // Constructor to initialize the list of candidates
    function Voting(bytes32[] candidateNames) {
        candidateList = candidateNames;
    }

    // Returns the total votes a candidate has received
    function totalVotesFor(bytes32 candidate) returns (uint8) {
        require(validCandidate(candidate), "Invalid candidate name");
        return votesReceived[candidate];
    }

    // Increment vote count for a candidate
    function voteForCandidate(bytes32 candidate) {
        require(validCandidate(candidate), "Invalid candidate name");
        votesReceived[candidate] += 1;
    }

    // Check if the candidate is valid
    function validCandidate(bytes32 candidate) returns (bool) {
        for(uint i = 0; i < candidateList.length; i++) {
            if (candidateList[i] == candidate) {
                return true;
            }
        }
        return false;
    }
}
