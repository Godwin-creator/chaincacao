// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ChainCacao {
    // ─── Structs ────────────────────────────────────────────────────────────

    struct Lot {
        uint256 id;
        address farmer;
        string  gpsLat;
        string  gpsLng;
        uint256 weightKg;
        string  species;
        uint256 harvestDate;
        address currentOwner;
    }

    struct Transfer {
        address fromActor;
        address toActor;
        uint256 timestamp;
        string  notes;
    }

    struct Actor {
        address addr;
        string  role;
        string  name;
        bool    registered;
    }

    // ─── State ───────────────────────────────────────────────────────────────

    address public admin;
    uint256 private _nextLotId;

    mapping(uint256 => Lot)        private _lots;
    mapping(uint256 => Transfer[]) private _history;
    mapping(address => Actor)      private _actors;

    // ─── Events ──────────────────────────────────────────────────────────────

    event LotCreated(uint256 indexed lotId, address indexed farmer);
    event LotTransferred(uint256 indexed lotId, address indexed from, address indexed to);
    event ActorRegistered(address indexed actor, string role);

    // ─── Modifiers ───────────────────────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "ChainCacao: not admin");
        _;
    }

    modifier onlyRegistered() {
        require(_actors[msg.sender].registered, "ChainCacao: not registered");
        _;
    }

    modifier lotExists(uint256 lotId) {
        require(lotId < _nextLotId, "ChainCacao: lot does not exist");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor() {
        admin = msg.sender;
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    function registerActor(
        address actor,
        string calldata role,
        string calldata name
    ) external onlyAdmin {
        _actors[actor] = Actor({addr: actor, role: role, name: name, registered: true});
        emit ActorRegistered(actor, role);
    }

    // ─── Lot lifecycle ───────────────────────────────────────────────────────

    function createLot(
        string calldata gpsLat,
        string calldata gpsLng,
        uint256 weightKg,
        string calldata species,
        uint256 harvestDate
    ) external onlyRegistered returns (uint256 lotId) {
        lotId = _nextLotId++;
        _lots[lotId] = Lot({
            id:           lotId,
            farmer:       msg.sender,
            gpsLat:       gpsLat,
            gpsLng:       gpsLng,
            weightKg:     weightKg,
            species:      species,
            harvestDate:  harvestDate,
            currentOwner: msg.sender
        });
        emit LotCreated(lotId, msg.sender);
    }

    function transferLot(
        uint256 lotId,
        address to,
        string calldata notes
    ) external lotExists(lotId) {
        Lot storage lot = _lots[lotId];
        require(lot.currentOwner == msg.sender, "ChainCacao: not owner");
        require(_actors[to].registered,          "ChainCacao: recipient not registered");

        _history[lotId].push(Transfer({
            fromActor: msg.sender,
            toActor:   to,
            timestamp: block.timestamp,
            notes:     notes
        }));

        address previous  = lot.currentOwner;
        lot.currentOwner  = to;
        emit LotTransferred(lotId, previous, to);
    }

    // ─── Views ───────────────────────────────────────────────────────────────

    function getLot(uint256 lotId) external view lotExists(lotId) returns (Lot memory) {
        return _lots[lotId];
    }

    function getLotHistory(uint256 lotId) external view lotExists(lotId) returns (Transfer[] memory) {
        return _history[lotId];
    }

    function getActor(address actor) external view returns (Actor memory) {
        return _actors[actor];
    }
}
