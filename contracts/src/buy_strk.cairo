#[starknet::contract]
mod BuyStrkContract {
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use openzeppelin::token::erc20::interface::{ERC20ABIDispatcher, ERC20ABIDispatcherTrait};

    #[storage]
    struct Storage {
        admin: ContractAddress,
        btc_deposit_rate: u256,  // How much STRK per 1 BTC (in smallest units)
        strk_reserves: u256,      // Total STRK available to sell
        escrow_contract: ContractAddress,  // Escrow for BTC deposits
        allowed_token: ContractAddress,    // STRK token address
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        BuyInitiated: BuyInitiated,
        BuyCompleted: BuyCompleted,
        BuyFailed: BuyFailed,
    }

    #[derive(Drop, starknet::Event)]
    struct BuyInitiated {
        buyer: ContractAddress,
        btc_amount: u256,
        strk_amount: u256,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct BuyCompleted {
        buyer: ContractAddress,
        btc_amount: u256,
        strk_amount: u256,
        escrow_id: felt252,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct BuyFailed {
        buyer: ContractAddress,
        reason: felt252,
        timestamp: u64,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        admin: ContractAddress,
        btc_rate: u256,  // e.g., 1 BTC = 50000 STRK
        initial_strk_reserves: u256,
        strk_token_address: ContractAddress,
        escrow_address: ContractAddress,
    ) {
        self.admin.write(admin);
        self.btc_deposit_rate.write(btc_rate);
        self.strk_reserves.write(initial_strk_reserves);
        self.allowed_token.write(strk_token_address);
        self.escrow_contract.write(escrow_address);
    }

    // ============================================
    // Core Buy STRK Function - BTC → STRK Bridge
    // ============================================
    #[external(v0)]
    fn buy_strk_with_btc(
        ref self: ContractState,
        buyer_address: ContractAddress,
        btc_amount: u256,     // BTC amount (in satoshis or smallest unit)
        proof_hash: felt252,  // ZK proof of BTC commitment
        escrow_id: felt252,   // Escrow ID for lock
    ) -> bool {
        assert!(btc_amount > 0, "BTC amount must be positive");

        let strk_token = ERC20ABIDispatcher { contract_address: self.allowed_token.read() };
        let strk_rate = self.btc_deposit_rate.read();
        
        // Calculate STRK output: btc_amount * rate
        let strk_to_receive = btc_amount * strk_rate / 1_000_000;
        
        // Check reserves
        let current_reserves = self.strk_reserves.read();
        assert!(strk_to_receive <= current_reserves, "Insufficient STRK reserves");

        // Deduct from reserves
        self.strk_reserves.write(current_reserves - strk_to_receive);

        // Transfer STRK to buyer
        let success = strk_token.transfer(buyer_address, strk_to_receive);
        assert!(success, "STRK transfer failed");

        self.emit(BuyInitiated {
            buyer: buyer_address,
            btc_amount,
            strk_amount: strk_to_receive,
            timestamp: starknet::get_block_timestamp(),
        });

        true
    }

    // ============================================
    // Admin Functions
    // ============================================
    #[external(v0)]
    fn set_btc_rate(ref self: ContractState, new_rate: u256) {
        let admin = self.admin.read();
        assert!(get_caller_address() == admin, "Only admin can set rate");
        self.btc_deposit_rate.write(new_rate);
    }

    #[external(v0)]
    fn add_strk_reserves(ref self: ContractState, amount: u256) {
        let admin = self.admin.read();
        assert!(get_caller_address() == admin, "Only admin can add reserves");
        
        let strk_token = ERC20ABIDispatcher { contract_address: self.allowed_token.read() };
        let success = strk_token.transferFrom(get_caller_address(), get_contract_address(), amount);
        assert!(success, "Reserve deposit failed");

        let current = self.strk_reserves.read();
        self.strk_reserves.write(current + amount);
    }

    #[external(v0)]
    fn withdraw_strk(ref self: ContractState, amount: u256) {
        let admin = self.admin.read();
        assert!(get_caller_address() == admin, "Only admin can withdraw");
        
        let current = self.strk_reserves.read();
        assert!(amount <= current, "Insufficient reserves");

        let strk_token = ERC20ABIDispatcher { contract_address: self.allowed_token.read() };
        let success = strk_token.transfer(admin, amount);
        assert!(success, "Withdrawal failed");

        self.strk_reserves.write(current - amount);
    }

    // ============================================
    // Query Functions
    // ============================================
    #[external(v0)]
    fn get_strk_output(self: @ContractState, btc_amount: u256) -> u256 {
        let rate = self.btc_deposit_rate.read();
        btc_amount * rate / 1_000_000
    }

    #[external(v0)]
    fn get_btc_rate(self: @ContractState) -> u256 {
        self.btc_deposit_rate.read()
    }

    #[external(v0)]
    fn get_strk_reserves(self: @ContractState) -> u256 {
        self.strk_reserves.read()
    }

    #[external(v0)]
    fn get_escrow_contract(self: @ContractState) -> ContractAddress {
        self.escrow_contract.read()
    }
}
