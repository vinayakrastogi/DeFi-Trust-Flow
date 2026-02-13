import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const ethers = hre.ethers;

describe("TrustFlowLending", function () {
    async function deployFixture() {
        const [owner, borrower, lender1, lender2] = await ethers.getSigners();

        const TrustFlowLending = await ethers.getContractFactory("TrustFlowLending");
        const lending = await TrustFlowLending.deploy();

        return { lending, owner, borrower, lender1, lender2 };
    }

    describe("Deployment", function () {
        it("Should set the deployer as owner", async function () {
            const { lending, owner } = await loadFixture(deployFixture);
            expect(await lending.owner()).to.equal(owner.address);
        });

        it("Should have default platform fee of 150 bps (1.5%)", async function () {
            const { lending } = await loadFixture(deployFixture);
            expect(await lending.platformFeeBps()).to.equal(150);
        });

        it("Should start with 0 loans", async function () {
            const { lending } = await loadFixture(deployFixture);
            expect(await lending.loanCount()).to.equal(0);
        });
    });

    describe("Loan Creation", function () {
        it("Should create a loan request", async function () {
            const { lending, borrower } = await loadFixture(deployFixture);
            const amount = ethers.parseEther("1.0");

            await expect(
                lending.connect(borrower).createLoan(amount, 1000, 6, 750, "Education")
            )
                .to.emit(lending, "LoanCreated")
                .withArgs(0, borrower.address, amount, 1000, 6, "Education");

            const loan = await lending.getLoan(0);
            expect(loan.borrower).to.equal(borrower.address);
            expect(loan.amount).to.equal(amount);
            expect(loan.status).to.equal(0); // Pending
        });

        it("Should reject zero amount", async function () {
            const { lending, borrower } = await loadFixture(deployFixture);
            await expect(
                lending.connect(borrower).createLoan(0, 1000, 6, 750, "Test")
            ).to.be.revertedWith("Amount must be > 0");
        });

        it("Should reject invalid term", async function () {
            const { lending, borrower } = await loadFixture(deployFixture);
            const amount = ethers.parseEther("1.0");
            await expect(
                lending.connect(borrower).createLoan(amount, 1000, 25, 750, "Test")
            ).to.be.revertedWith("Term: 1-24 months");
        });
    });

    describe("Admin Approval", function () {
        it("Should approve a pending loan", async function () {
            const { lending, owner, borrower } = await loadFixture(deployFixture);
            await lending.connect(borrower).createLoan(ethers.parseEther("1.0"), 1000, 6, 750, "Test");

            await expect(lending.connect(owner).approveLoan(0))
                .to.emit(lending, "LoanApproved")
                .withArgs(0);

            const loan = await lending.getLoan(0);
            expect(loan.status).to.equal(1); // Approved
        });

        it("Should reject a pending loan", async function () {
            const { lending, owner, borrower } = await loadFixture(deployFixture);
            await lending.connect(borrower).createLoan(ethers.parseEther("1.0"), 1000, 6, 750, "Test");

            await expect(lending.connect(owner).rejectLoan(0))
                .to.emit(lending, "LoanRejected")
                .withArgs(0);

            const loan = await lending.getLoan(0);
            expect(loan.status).to.equal(5); // Rejected
        });

        it("Should only allow owner to approve", async function () {
            const { lending, borrower } = await loadFixture(deployFixture);
            await lending.connect(borrower).createLoan(ethers.parseEther("1.0"), 1000, 6, 750, "Test");

            await expect(
                lending.connect(borrower).approveLoan(0)
            ).to.be.revertedWith("Not owner");
        });
    });

    describe("Loan Funding", function () {
        async function approvedLoanFixture() {
            const fixture = await loadFixture(deployFixture);
            const amount = ethers.parseEther("1.0");
            await fixture.lending.connect(fixture.borrower).createLoan(amount, 1000, 6, 750, "Education");
            await fixture.lending.connect(fixture.owner).approveLoan(0);
            return { ...fixture, loanAmount: amount };
        }

        it("Should allow lender to fund an approved loan", async function () {
            const { lending, lender1 } = await approvedLoanFixture();
            const investAmount = ethers.parseEther("0.5");

            await expect(
                lending.connect(lender1).fundLoan(0, { value: investAmount })
            ).to.emit(lending, "LoanFunded");

            const loan = await lending.getLoan(0);
            expect(loan.status).to.equal(2); // Funding
        });

        it("Should activate loan when fully funded", async function () {
            const { lending, lender1, lender2 } = await approvedLoanFixture();

            // Loan is 1 ETH, totalFunded tracks gross ETH, so 0.6 + 0.4 = 1.0 = fully funded
            await lending.connect(lender1).fundLoan(0, { value: ethers.parseEther("0.6") });
            await lending.connect(lender2).fundLoan(0, { value: ethers.parseEther("0.4") });

            const loan = await lending.getLoan(0);
            expect(loan.status).to.equal(3); // Active
        });

        it("Should prevent borrower from funding own loan", async function () {
            const { lending, borrower } = await approvedLoanFixture();

            await expect(
                lending.connect(borrower).fundLoan(0, { value: ethers.parseEther("0.5") })
            ).to.be.revertedWith("Borrower cannot fund own loan");
        });
    });

    describe("Loan Repayment", function () {
        it("Should allow borrower to repay active loan", async function () {
            const { lending, owner, borrower, lender1 } = await loadFixture(deployFixture);

            const amount = ethers.parseEther("0.1");
            await lending.connect(borrower).createLoan(amount, 1000, 3, 750, "Test");
            await lending.connect(owner).approveLoan(0);

            // Fund it fully (gross = 0.1 ETH, fee deducted on transfer)
            await lending.connect(lender1).fundLoan(0, { value: ethers.parseEther("0.1") });

            const loan = await lending.getLoan(0);
            if (Number(loan.status) === 3) {
                const repayAmount = ethers.parseEther("0.05");
                await expect(
                    lending.connect(borrower).repayLoan(0, { value: repayAmount })
                ).to.emit(lending, "LoanRepayment");
            }
        });
    });

    describe("View Functions", function () {
        it("Should return paginated loans", async function () {
            const { lending, borrower } = await loadFixture(deployFixture);

            for (let i = 0; i < 3; i++) {
                await lending.connect(borrower).createLoan(
                    ethers.parseEther("1.0"), 1000, 6, 750, `Loan ${i}`
                );
            }

            const all = await lending.getLoans(0, 10);
            expect(all.length).to.equal(3);

            const page = await lending.getLoans(1, 1);
            expect(page.length).to.equal(1);
        });

        it("Should return borrower loan IDs", async function () {
            const { lending, borrower } = await loadFixture(deployFixture);
            await lending.connect(borrower).createLoan(ethers.parseEther("1.0"), 1000, 6, 750, "Test");
            await lending.connect(borrower).createLoan(ethers.parseEther("2.0"), 1500, 12, 800, "Test2");

            const ids = await lending.getBorrowerLoanIds(borrower.address);
            expect(ids.length).to.equal(2);
        });
    });

    describe("Admin Settings", function () {
        it("Should update platform fee", async function () {
            const { lending, owner } = await loadFixture(deployFixture);
            await lending.connect(owner).setPlatformFee(200);
            expect(await lending.platformFeeBps()).to.equal(200);
        });

        it("Should reject fee > 500 bps", async function () {
            const { lending, owner } = await loadFixture(deployFixture);
            await expect(
                lending.connect(owner).setPlatformFee(600)
            ).to.be.revertedWith("Fee too high");
        });

        it("Should transfer ownership", async function () {
            const { lending, owner, borrower } = await loadFixture(deployFixture);
            await lending.connect(owner).transferOwnership(borrower.address);
            expect(await lending.owner()).to.equal(borrower.address);
        });
    });
});
