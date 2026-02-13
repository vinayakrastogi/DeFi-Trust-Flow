// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TrustFlowLending
 * @notice Decentralized micro-lending contract for the TrustFlow platform.
 *         Borrowers create loan requests, lenders fund them with ETH,
 *         and borrowers repay over time. Admin (owner) approves/rejects loans.
 */
contract TrustFlowLending {
    // ─── Enums ───────────────────────────────────────────────────────────────

    enum LoanStatus {
        Pending,    // 0 — awaiting admin approval
        Approved,   // 1 — approved, awaiting funding
        Funding,    // 2 — partially funded
        Active,     // 3 — fully funded, repayment in progress
        Repaid,     // 4 — fully repaid
        Rejected,   // 5 — rejected by admin
        Defaulted   // 6 — borrower defaulted
    }

    // ─── Structs ─────────────────────────────────────────────────────────────

    struct Loan {
        uint256 id;
        address borrower;
        uint256 amount;          // in wei
        uint256 interestRate;    // basis points (e.g., 1000 = 10%)
        uint256 termMonths;
        uint256 riskScore;       // 0-1000
        string purpose;
        LoanStatus status;
        uint256 totalFunded;
        uint256 totalRepaid;
        uint256 createdAt;
        uint256 fundedAt;
        uint256 monthlyPayment;
        uint256 platformFee;     // fee taken on funding
    }

    struct Investment {
        address lender;
        uint256 amount;
        uint256 timestamp;
    }

    struct Repayment {
        address borrower;
        uint256 amount;
        uint256 timestamp;
    }

    // ─── State ───────────────────────────────────────────────────────────────

    address public owner;
    uint256 public platformFeeBps = 150; // 1.5% default
    uint256 public loanCount;

    mapping(uint256 => Loan) public loans;
    mapping(uint256 => Investment[]) public loanInvestments;
    mapping(uint256 => Repayment[]) public loanRepayments;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => uint256[]) public lenderInvestments;

    uint256 public totalPlatformFees;

    // ─── Events ──────────────────────────────────────────────────────────────

    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 interestRate,
        uint256 termMonths,
        string purpose
    );
    event LoanApproved(uint256 indexed loanId);
    event LoanRejected(uint256 indexed loanId);
    event LoanFunded(
        uint256 indexed loanId,
        address indexed lender,
        uint256 amount,
        uint256 totalFunded
    );
    event LoanActivated(uint256 indexed loanId);
    event LoanRepayment(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 totalRepaid
    );
    event LoanFullyRepaid(uint256 indexed loanId);
    event PlatformFeeUpdated(uint256 newFeeBps);
    event FundsWithdrawn(address indexed to, uint256 amount);

    // ─── Modifiers ───────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier loanExists(uint256 _loanId) {
        require(_loanId < loanCount, "Loan not found");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─── Borrower Functions ──────────────────────────────────────────────────

    /**
     * @notice Create a new loan request.
     * @param _amount Loan amount in wei
     * @param _interestRate Annual interest rate in basis points (e.g., 1000 = 10%)
     * @param _termMonths Loan duration in months
     * @param _riskScore Borrower's risk score (0-1000)
     * @param _purpose Loan purpose description
     */
    function createLoan(
        uint256 _amount,
        uint256 _interestRate,
        uint256 _termMonths,
        uint256 _riskScore,
        string calldata _purpose
    ) external returns (uint256) {
        require(_amount > 0, "Amount must be > 0");
        require(_termMonths > 0 && _termMonths <= 24, "Term: 1-24 months");
        require(_interestRate > 0 && _interestRate <= 5000, "Rate: 1-5000 bps");
        require(_riskScore <= 1000, "Score: 0-1000");

        uint256 loanId = loanCount++;

        // Calculate monthly payment: P * (r(1+r)^n) / ((1+r)^n - 1)
        uint256 monthlyPayment = _calculateMonthlyPayment(_amount, _interestRate, _termMonths);

        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            amount: _amount,
            interestRate: _interestRate,
            termMonths: _termMonths,
            riskScore: _riskScore,
            purpose: _purpose,
            status: LoanStatus.Pending,
            totalFunded: 0,
            totalRepaid: 0,
            createdAt: block.timestamp,
            fundedAt: 0,
            monthlyPayment: monthlyPayment,
            platformFee: 0
        });

        borrowerLoans[msg.sender].push(loanId);

        emit LoanCreated(loanId, msg.sender, _amount, _interestRate, _termMonths, _purpose);
        return loanId;
    }

    /**
     * @notice Repay part of an active loan.
     * @param _loanId The loan to repay
     */
    function repayLoan(uint256 _loanId) external payable loanExists(_loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender, "Not borrower");
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(msg.value > 0, "Must send ETH");

        loan.totalRepaid += msg.value;

        loanRepayments[_loanId].push(Repayment({
            borrower: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        emit LoanRepayment(_loanId, msg.sender, msg.value, loan.totalRepaid);

        // Check if fully repaid (principal + interest)
        uint256 totalOwed = _calculateTotalOwed(loan.amount, loan.interestRate, loan.termMonths);
        if (loan.totalRepaid >= totalOwed) {
            loan.status = LoanStatus.Repaid;
            emit LoanFullyRepaid(_loanId);

            // Distribute repayments to lenders proportionally
            _distributeFunds(_loanId);
        }
    }

    // ─── Lender Functions ────────────────────────────────────────────────────

    /**
     * @notice Fund a loan with ETH.
     * @param _loanId The loan to fund
     */
    function fundLoan(uint256 _loanId) external payable loanExists(_loanId) {
        Loan storage loan = loans[_loanId];
        require(
            loan.status == LoanStatus.Approved || loan.status == LoanStatus.Funding,
            "Loan not accepting funds"
        );
        require(msg.sender != loan.borrower, "Borrower cannot fund own loan");
        require(msg.value > 0, "Must send ETH");

        uint256 remaining = loan.amount - loan.totalFunded;
        require(msg.value <= remaining, "Exceeds remaining amount");

        // Track full msg.value as funded (fee is deducted on transfer to borrower)
        loan.totalFunded += msg.value;

        // Calculate platform fee (held in contract balance)
        uint256 fee = (msg.value * platformFeeBps) / 10000;
        totalPlatformFees += fee;
        loan.platformFee += fee;

        loanInvestments[_loanId].push(Investment({
            lender: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        lenderInvestments[msg.sender].push(_loanId);

        // Update status
        if (loan.status == LoanStatus.Approved) {
            loan.status = LoanStatus.Funding;
        }

        emit LoanFunded(_loanId, msg.sender, msg.value, loan.totalFunded);

        // Check if fully funded
        if (loan.totalFunded >= loan.amount) {
            loan.status = LoanStatus.Active;
            loan.fundedAt = block.timestamp;

            // Transfer funds to borrower (minus accumulated platform fees)
            uint256 borrowerAmount = loan.totalFunded - loan.platformFee;
            (bool sent, ) = loan.borrower.call{value: borrowerAmount}("");
            require(sent, "Transfer to borrower failed");

            emit LoanActivated(_loanId);
        }
    }

    // ─── Admin Functions ─────────────────────────────────────────────────────

    /**
     * @notice Approve a pending loan for funding.
     */
    function approveLoan(uint256 _loanId) external onlyOwner loanExists(_loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Pending, "Not pending");
        loan.status = LoanStatus.Approved;
        emit LoanApproved(_loanId);
    }

    /**
     * @notice Reject a pending loan.
     */
    function rejectLoan(uint256 _loanId) external onlyOwner loanExists(_loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Pending, "Not pending");
        loan.status = LoanStatus.Rejected;
        emit LoanRejected(_loanId);
    }

    /**
     * @notice Update the platform fee percentage.
     * @param _newFeeBps New fee in basis points (max 500 = 5%)
     */
    function setPlatformFee(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= 500, "Fee too high");
        platformFeeBps = _newFeeBps;
        emit PlatformFeeUpdated(_newFeeBps);
    }

    /**
     * @notice Withdraw accumulated platform fees.
     */
    function withdrawFees(address payable _to) external onlyOwner {
        uint256 amount = totalPlatformFees;
        require(amount > 0, "No fees");
        totalPlatformFees = 0;
        (bool sent, ) = _to.call{value: amount}("");
        require(sent, "Withdrawal failed");
        emit FundsWithdrawn(_to, amount);
    }

    /**
     * @notice Transfer ownership.
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Zero address");
        owner = _newOwner;
    }

    // ─── View Functions ──────────────────────────────────────────────────────

    function getLoan(uint256 _loanId) external view loanExists(_loanId) returns (Loan memory) {
        return loans[_loanId];
    }

    function getLoanInvestments(uint256 _loanId) external view returns (Investment[] memory) {
        return loanInvestments[_loanId];
    }

    function getLoanRepayments(uint256 _loanId) external view returns (Repayment[] memory) {
        return loanRepayments[_loanId];
    }

    function getBorrowerLoanIds(address _borrower) external view returns (uint256[] memory) {
        return borrowerLoans[_borrower];
    }

    function getLenderInvestmentIds(address _lender) external view returns (uint256[] memory) {
        return lenderInvestments[_lender];
    }

    function getLoanCount() external view returns (uint256) {
        return loanCount;
    }

    /**
     * @notice Get total owed for a loan (principal + interest).
     */
    function getTotalOwed(uint256 _loanId) external view loanExists(_loanId) returns (uint256) {
        Loan storage loan = loans[_loanId];
        return _calculateTotalOwed(loan.amount, loan.interestRate, loan.termMonths);
    }

    /**
     * @notice Get all loans in a paginated manner.
     * @param _offset Start index
     * @param _limit Max number of loans to return
     */
    function getLoans(uint256 _offset, uint256 _limit) external view returns (Loan[] memory) {
        uint256 end = _offset + _limit;
        if (end > loanCount) end = loanCount;
        uint256 count = end > _offset ? end - _offset : 0;

        Loan[] memory result = new Loan[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = loans[_offset + i];
        }
        return result;
    }

    // ─── Internal Functions ──────────────────────────────────────────────────

    /**
     * @dev Calculate total owed: principal * (1 + rate * months / 12)
     *      Using simple interest for gas efficiency.
     */
    function _calculateTotalOwed(
        uint256 _amount,
        uint256 _rateBps,
        uint256 _termMonths
    ) internal pure returns (uint256) {
        // Simple interest: P * (1 + r * t)
        // r = _rateBps / 10000 (annual), t = _termMonths / 12
        uint256 interest = (_amount * _rateBps * _termMonths) / (10000 * 12);
        return _amount + interest;
    }

    /**
     * @dev Calculate approximate monthly payment.
     */
    function _calculateMonthlyPayment(
        uint256 _amount,
        uint256 _rateBps,
        uint256 _termMonths
    ) internal pure returns (uint256) {
        uint256 totalOwed = _calculateTotalOwed(_amount, _rateBps, _termMonths);
        return totalOwed / _termMonths;
    }

    /**
     * @dev Distribute repaid funds to lenders proportionally.
     */
    function _distributeFunds(uint256 _loanId) internal {
        Loan storage loan = loans[_loanId];
        Investment[] storage investments = loanInvestments[_loanId];

        uint256 totalToDistribute = address(this).balance > loan.totalRepaid
            ? loan.totalRepaid
            : address(this).balance;

        for (uint256 i = 0; i < investments.length; i++) {
            uint256 share = (totalToDistribute * investments[i].amount) / loan.totalFunded;
            if (share > 0) {
                (bool sent, ) = investments[i].lender.call{value: share}("");
                require(sent, "Lender payout failed");
            }
        }
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
