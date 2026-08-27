// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcCustomToken
 * @dev Standard ERC-20 Token deployed autonomously by ArcTokenFactory on Arc Testnet (Chain ID: 5042002).
 */
contract ArcCustomToken {
    string public name;
    string public symbol;
    uint8 public immutable decimals;
    uint256 public totalSupply;
    address public immutable owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        uint8 _decimals,
        address _recipient
    ) {
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_symbol).length > 0, "Symbol required");
        require(_decimals <= 18, "Decimals <= 18");
        require(_initialSupply > 0, "Supply > 0");

        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        owner = _recipient;
        totalSupply = _initialSupply * (10 ** uint256(_decimals));
        balanceOf[_recipient] = totalSupply;
        emit Transfer(address(0), _recipient, totalSupply);
    }

    function transfer(address _to, uint256 _value) external returns (bool) {
        require(_to != address(0), "Invalid recipient");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) external returns (bool) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) external returns (bool) {
        require(_to != address(0), "Invalid recipient");
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Insufficient allowance");
        balanceOf[_from] -= _value;
        allowance[_from][msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}

/**
 * @title ArcTokenFactory
 * @dev 1-Click ERC-20 Token Launchpad & Directory on Arc Testnet.
 */
contract ArcTokenFactory {
    struct TokenMetadata {
        address tokenAddress;
        string name;
        string symbol;
        uint256 initialSupply;
        uint8 decimals;
        address creator;
        uint256 createdAt;
    }

    TokenMetadata[] public allTokens;
    mapping(address => address[]) public tokensByCreator;

    event TokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        uint256 initialSupply,
        uint8 decimals,
        address indexed creator,
        uint256 createdAt
    );

    /**
     * @notice Deploy a brand new custom ERC-20 token in 1 click
     * @param _name Name of token (e.g. "ArcPulse Token")
     * @param _symbol Ticker symbol (e.g. "APULSE")
     * @param _initialSupply Total supply (e.g. 1000000)
     * @param _decimals Decimal places (default 18)
     */
    function createToken(
        string calldata _name,
        string calldata _symbol,
        uint256 _initialSupply,
        uint8 _decimals
    ) external returns (address) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_symbol).length > 0, "Symbol cannot be empty");
        require(_initialSupply > 0, "Initial supply must be > 0");
        require(_decimals <= 18, "Decimals must be <= 18");

        ArcCustomToken newToken = new ArcCustomToken(
            _name,
            _symbol,
            _initialSupply,
            _decimals,
            msg.sender
        );

        address tokenAddr = address(newToken);

        TokenMetadata memory meta = TokenMetadata({
            tokenAddress: tokenAddr,
            name: _name,
            symbol: _symbol,
            initialSupply: _initialSupply,
            decimals: _decimals,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        allTokens.push(meta);
        tokensByCreator[msg.sender].push(tokenAddr);

        emit TokenCreated(
            tokenAddr,
            _name,
            _symbol,
            _initialSupply,
            _decimals,
            msg.sender,
            block.timestamp
        );

        return tokenAddr;
    }

    function getTotalTokensCount() external view returns (uint256) {
        return allTokens.length;
    }

    function getAllTokens() external view returns (TokenMetadata[] memory) {
        return allTokens;
    }

    function getTokensByCreator(address _creator) external view returns (address[] memory) {
        return tokensByCreator[_creator];
    }
}
