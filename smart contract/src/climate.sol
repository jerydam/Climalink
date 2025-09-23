// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IClimaLinkToken {
    function mint(address to, uint256 amount) external;
}

contract ClimaLinkClimate is ReentrancyGuard, Pausable, Ownable {
    enum ReportStatus { Pending, Validated, Rejected }
    enum Role { None, Reporter, Validator }

    struct ReportInput {
        string weather;
        int128 temperature;
        uint128 humidity;
        string location;
        int128 longitude;
        int128 latitude;
    }

    struct Report {
        string location;
        int128 longitude;
        int128 latitude;
        int128 temperature;
        uint128 humidity;
        string weather;
        address reporter;
        uint256 timestamp;
        ReportStatus status;
        uint256 validationCount;
        mapping(address => bool) validatedBy;
    }

    struct ReportView {
        string location;
        int128 longitude;
        int128 latitude;
        int128 temperature;
        uint128 humidity;
        string weather;
        address reporter;
        uint256 timestamp;
        ReportStatus status;
        uint256 validationCount;
    }

    mapping(uint128 => Report) public reports;
    uint128 public reportCount;
    uint256 public constant MIN_VALIDATION_REQUIRED = 2;
    uint256 public constant REPORT_REWARD = 20 * 10**18; // 20 CTK tokens
    IClimaLinkToken public immutable tokenContract;
    mapping(address => Role) public userRoles;

    event ClimateEvent(uint128 indexed index, string message);
    event ReportValidated(uint128 indexed index, address indexed validator);
    event ReportRejected(uint128 indexed index, address indexed validator);
    event RoleAssigned(address indexed user, Role role);

    modifier validReportData(ReportInput memory input) {
        require(bytes(input.weather).length > 0 && bytes(input.weather).length <= 50, "Invalid weather description");
        require(input.temperature >= -100 && input.temperature <= 100, "Invalid temperature range");
        require(input.humidity <= 100, "Invalid humidity range");
        require(bytes(input.location).length > 0 && bytes(input.location).length <= 100, "Invalid location");
        require(input.longitude >= -180000 && input.longitude <= 180000, "Invalid longitude");
        require(input.latitude >= -90000 && input.latitude <= 90000, "Invalid latitude");
        _;
    }

    modifier onlyReporter() {
        require(userRoles[msg.sender] == Role.Reporter || userRoles[msg.sender] == Role.None, "Validators cannot report");
        _;
    }

    modifier onlyValidator() {
        require(userRoles[msg.sender] == Role.Validator, "Only validators can perform this action");
        _;
    }

    constructor(address _tokenContract) Ownable(msg.sender) {
        require(_tokenContract != address(0), "Invalid token contract address");
        tokenContract = IClimaLinkToken(_tokenContract);
    }

    function joinAsReporterOrValidator(bool wantValidator) external whenNotPaused {
        require(userRoles[msg.sender] == Role.None, "User already has a role");
        Role newRole = wantValidator ? Role.Validator : Role.Reporter;
        userRoles[msg.sender] = newRole;
        emit RoleAssigned(msg.sender, newRole);
    }

    function createClimateReport(ReportInput memory input)
        external
        nonReentrant
        whenNotPaused
        validReportData(input)
        onlyReporter
        returns (uint128)
    {
        uint128 index = reportCount + 1;
        reportCount = index;

        Report storage newReport = reports[index];
        newReport.weather = input.weather;
        newReport.temperature = input.temperature;
        newReport.humidity = input.humidity;
        newReport.location = input.location;
        newReport.longitude = input.longitude;
        newReport.latitude = input.latitude;
        newReport.reporter = msg.sender;
        newReport.timestamp = block.timestamp;
        newReport.status = ReportStatus.Pending;

        emit ClimateEvent(index, "New Climate Report Added");
        return index;
    }

    function validateReport(uint128 index, bool isValid) external whenNotPaused onlyValidator {
        require(index > 0 && index <= reportCount, "Invalid report index");
        Report storage report = reports[index];
        require(report.status == ReportStatus.Pending, "Report already processed");
        require(!report.validatedBy[msg.sender], "Already validated");
        require(report.reporter != msg.sender, "Cannot validate own report");

        report.validatedBy[msg.sender] = true;

        if (isValid) {
            report.validationCount += 1;
            if (report.validationCount >= MIN_VALIDATION_REQUIRED) {
                report.status = ReportStatus.Validated;
                tokenContract.mint(report.reporter, REPORT_REWARD);
            }
            emit ReportValidated(index, msg.sender);
        } else {
            report.status = ReportStatus.Rejected;
            emit ReportRejected(index, msg.sender);
        }
    }

    function getClimateReport(uint128 index) external view returns (ReportView memory) {
        require(index > 0 && index <= reportCount, "Invalid report index");
        Report storage report = reports[index];
        return ReportView({
            location: report.location,
            longitude: report.longitude,
            latitude: report.latitude,
            temperature: report.temperature,
            humidity: report.humidity,
            weather: report.weather,
            reporter: report.reporter,
            timestamp: report.timestamp,
            status: report.status,
            validationCount: report.validationCount
        });
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}