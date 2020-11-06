const SeedCertifi = artifacts.require("./SeedCertifi.sol");

module.exports = function (deployer) {
  deployer.deploy(SeedCertifi);
};