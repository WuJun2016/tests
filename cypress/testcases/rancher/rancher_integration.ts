import YAML from 'js-yaml'
import { rancherPage } from "@/pageobjects/rancher.po";
import { ImagePage } from "@/pageobjects/image.po";
import SettingsPagePo from "@/pageobjects/settings.po";
import NetworkPage from "@/pageobjects/network.po";
import type { CypressChainable } from '@/utils/po.types'
import { Constants } from '../../constants/constants'


const constants = new Constants();
const rancher = new rancherPage();
const image = new ImagePage();
const settings = new SettingsPagePo();
const network = new NetworkPage();

let mainDomainUrl = '';
let crossDomainUrl = '';

var registrationURL

/**
 * 1. Create image with cloud image available for openSUSE. http://download.opensuse.org/repositories/Cloud:/Images:/Leap_15.3/images/openSUSE-Leap-15.3.x86_64-NoCloud.qcow2
 * 2. Click save
 * 3. Try to edit the description
 * 4. Try to edit the URL
 * 5. Try to edit the Labels
 * Expected Results
 * 1. Image should show state as Active.
 * 2. Image should show progress as Completed.
 * 3. User should be able to edit the description and Labels
 * 4. User should not be able to edit the URL
 * 5. User should be able to create a new image with same name.
 */
describe('Rancher Integration Test', () => {
    // const IMAGE_NAME = 'focal-server-cloudimg-amd64';
    // const IMAGE_URL = 'https://cloud-images.ubuntu.com/focal/current/focal-server-cloudimg-amd64.img';

    const IMAGE_NAME = 'opensuseleap';
    const IMAGE_URL = 'http://download.opensuse.org/repositories/Cloud:/Images:/Leap_15.3/images/openSUSE-Leap-15.3.x86_64-NoCloud.qcow2';
    

    const value = {
        name: IMAGE_NAME,
        url: IMAGE_URL,
        size: '545 MB',
        // labels: {
        //     y1: 'z1',
        //     y2: 'z2'
        // }
    }

    it('Prepare Harvester Image', () => {
        cy.login();

        // create IMAGE according to the value set
        image.goToCreate();
        image.create(value);
        image.checkState(value);

        // // Enable network
        // settings.enableVLAN('harvester-mgmt')

        // // Create vlan1 virtual network
        // network.createVLAN('vlan1', 'default', '1')

    });

    it('Prepare Harvester VLAN network', () => {
        cy.login();

        // Enable network
        settings.enableVLAN('harvester-mgmt')

        // Create vlan1, id:1 virtual network
        network.createVLAN('vlan1', 'default', '1')

    });



    it.only('Rancher import Harvester', { baseUrl: constants.rancherUrl}, function () {
        // cy.login();
        cy.visit('/');

        //First time -> firstTimeLogin(), afterward -> login()
        rancher.rancherLogin();
        
        
        let rURL = rancher.importHarvester();
        console.log('------', rURL);

        // cy.get('.copy').invoke('text').then((text) => {
        //     registrationURL = text;
        //     cy.log(text);
        
        //     // cy.task('setMyUniqueId', url)
        //     // let myUniqueId = text;
            
        //     // cy.task('setMyUniqueId', myUniqueId)
        //     // cy.wrap(rURL).as('rURL');
        //     // cy.log(text)
        // });
        

    });

    // it.only('share alais', function() {
    //     cy.login();
        
    //     cy.get(':nth-child(1) > :nth-child(2) > .has-tooltip').invoke('text').as('version');

    //     // cy.get(this.rURL).should('contain', '192.168.0.131')
    // });



    it.only('Harvester import Rancher', function() {
        cy.login();
        cy.get('h6').click();
        cy.get(':nth-child(2) > .list-unstyled > :nth-child(6) > a > .label').click();
        cy.get('#cluster-registration-url > .btn').click();
        cy.get('li > span').click();
        

        // cy.task('getMyUniqueId').then((myUniqueId) => {
        //    cy.log('${myUniqueId}');
        // });
        
    });


});


