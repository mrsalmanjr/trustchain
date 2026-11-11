// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TrustChainLedger {
    address public admin;

    struct DonationRecord {
        string donationId;
        string campaignId;
        uint256 amount;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => DonationRecord) public donations;
    
    event DonationRecorded(string indexed donationId, string indexed campaignId, uint256 amount, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can record donations");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Function to record a verified donation hash on the blockchain
    function recordDonation(string memory _donationId, string memory _campaignId, uint256 _amount) public onlyAdmin {
        require(!donations[_donationId].exists, "Donation already recorded");

        donations[_donationId] = DonationRecord({
            donationId: _donationId,
            campaignId: _campaignId,
            amount: _amount,
            timestamp: block.timestamp,
            exists: true
        });

        emit DonationRecorded(_donationId, _campaignId, _amount, block.timestamp);
    }

    // Function to retrieve donation details
    function getDonation(string memory _donationId) public view returns (string memory, string memory, uint256, uint256) {
        require(donations[_donationId].exists, "Donation record not found");
        DonationRecord memory record = donations[_donationId];
        return (record.donationId, record.campaignId, record.amount, record.timestamp);
    }
}
