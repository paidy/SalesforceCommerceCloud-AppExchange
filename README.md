# Salesforce Commerce Cloud Paidy Cartridge

Paidy provides a LINK cartridge to integrate with Salesforce Commerce Cloud (SFCC).

This cartridge enables a SFCC storefront to use the Paidy payment service.
This cartridge supports SFRA version 6.1.0 and SiteGenesis JS-Controllers


## Version

|Cartridge|version|
|-|-|
|int_paidy / int_paidy_controllers |24.4.0|
|int_paidy_sfra|24.4.0|

## Integration

|Cartridge|Integration|
|-|-|
|int_paidy / int_paidy_controllers |./documentation/Paidy_Integration_Guide_v24.4.0_en.pdf|
|int_paidy / int_paidy_controllers |./documentation/Paidy_設定手順書_v24.4.0.pdf|
|int_paidy_sfra|./documentation/Paidy_sfra_Integration_Guide_v24.4.0_en.pdf|
|int_paidy_sfra|./documentation/Paidy_sfra 設定手順書_v24.4.0.pdf|


## Testing

### Running unit tests
1. Open a command prompt in `link_paidy` directory and run the following commands
  1. `npm install`
  1. `npm run test`


### Running integration tests
1. Download `app_storefront_base` cartridge
  - URL : `https://github.com/SalesforceCommerceCloud/storefront-reference-architecture`
1. Place `app_storefront_base` cartridge in `link_paidy\cartridges`
1. Create `dw.json` in `link_paidy`
  ```
  {
    "hostname": "your-sandbox-hostname.demandware.net",
    "username": "yourlogin",
    "password": "yourpwd",
    "code-version": "version_yyyyMMdd"
  }
  ```
1. Change `baseUrl` of `test/integration/it.config.js` and `test\integration\itSG.config.js`
  - `it.config.js` : Referenced in SFRA integration test
  - `itSG.config.js` : Referenced in SiteGenesis integration test
1. Import the following xml into BM
  - test/data/customer.xml
1. Open a command prompt in `link_paidy` directory and run the following commands
  1. `npm install`
  1. `npm run test:integration`
