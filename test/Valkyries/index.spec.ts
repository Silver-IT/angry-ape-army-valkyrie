import supportedInterfaces from "./suites/supportedInterfaces.test";
import publicVariables from "./suites/publicVariables.test";
import baseURI from "./suites/baseURI.test";
import saleState from "./suites/saleState.test";
import moderator from "./suites/moderator.test";
import Mint from "./suites/mint.test";
import airdropping from "./suites/airdropping.test";
import royalty from "./suites/royalty.test";
import burn from "./suites/burn.test";
import preAuthorized from "./suites/preAuthorized.test";

describe("Valkyries", function () {
  describe("When supporting interfaces", supportedInterfaces.bind(this));
  describe("When getting public variables", publicVariables.bind(this));
  describe("When setting baseURI", baseURI.bind(this));
  describe("When changing sale state", saleState.bind(this));
  describe("When updating ownership", moderator.bind(this));
  describe("When minting", Mint.bind(this));
  describe("When airdropping", airdropping.bind(this));
  describe("When setting royalty receiver", royalty.bind(this));
  describe("When burning", burn.bind(this));
  describe("When pre authorizing", preAuthorized.bind(this));
});
