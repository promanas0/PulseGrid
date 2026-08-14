// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArchPulseFactory
 * @dev Official Factory Contract for Arc Testnet (Chain ID 5042002).
 * Deploys and manages Liquidity Pair pools for ArchPulse DEX.
 * ArchPulse Ecosystem.
 */

contract ArchPulsePair {
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
        require(msg.sender == factory, "ArchPulsePair: FORBIDDEN");
        token0 = _token0;
        token1 = _token1;
    }

    function updateReserves(uint256 _reserve0, uint256 _reserve1) external {
        require(msg.sender == factory || msg.sender == tx.origin, "ArchPulsePair: UNAUTHORIZED");
        reserve0 = _reserve0;
        reserve1 = _reserve1;
        emit Sync(reserve0, reserve1);
    }

    function getReserves() external view returns (uint256, uint256) {
        return (reserve0, reserve1);
    }
}

contract ArchPulseFactory {
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
        require(tokenA != tokenB, "ArchPulseFactory: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "ArchPulseFactory: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "ArchPulseFactory: PAIR_EXISTS");

        bytes memory bytecode = type(ArchPulsePair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        
        ArchPulsePair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);

        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, "ArchPulseFactory: FORBIDDEN");
        feeTo = _feeTo;
    }
}
