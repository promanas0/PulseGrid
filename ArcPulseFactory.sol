// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcPulseFactory
 * @dev Official Factory Contract for Arc Testnet (Chain ID 5042002).
 * Deploys and manages Liquidity Pair pools for ArcPulse DEX.
 * ArcPulse Ecosystem.
 */

contract ArcPulsePair {
    address public factory;
    address public token0;
    address public token1;

    uint256 public reserve0;
    uint256 public reserve1;

    event Sync(uint256 reserve0, uint256 reserve1);

    constructor() {
        factory = msg.sender;
    }

    function initialize(address _token0, address _token1) external {
        require(msg.sender == factory, "ArcPulsePair: FORBIDDEN");
        token0 = _token0;
        token1 = _token1;
    }

    function updateReserves(uint256 _reserve0, uint256 _reserve1) external {
        require(msg.sender == factory || msg.sender == tx.origin, "ArcPulsePair: UNAUTHORIZED");
        reserve0 = _reserve0;
        reserve1 = _reserve1;
        emit Sync(reserve0, reserve1);
    }

    function getReserves() external view returns (uint256, uint256) {
        return (reserve0, reserve1);
    }
}

contract ArcPulseFactory {
    address public feeTo;
    address public feeToSetter;

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint256 pairIndex);

    constructor() {
        feeToSetter = msg.sender;
    }

    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }

    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "ArcPulseFactory: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "ArcPulseFactory: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "ArcPulseFactory: PAIR_EXISTS");

        bytes memory bytecode = type(ArcPulsePair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        
        ArcPulsePair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);

        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, "ArcPulseFactory: FORBIDDEN");
        feeTo = _feeTo;
    }
}
