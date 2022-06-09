import type { CypressChainable } from '@/utils/po.types'
import { Constants } from '../constants/constants'
const constants = new Constants();
var registrationURL;

export class rancherPage {
    
    private login_page_usernameInput = '#username';
    private login_page_passwordInput = '#password > .labeled-input > input';
    private login_page_loginButton = '#submit > span';
    private main_page_title = '.title';
    private dashboardURL = 'dashboard/home';

    private boostrap_page_boostrapPWInput = 'input';
    private boostrap_page_boostrapPWSubmit = '#submit > span';
    private boostrap_page_radioSelectPW = ':nth-child(2) > .radio-container';
    private boostrap_page_newPWInput = ':nth-child(5) > .password > .labeled-input > input';
    private boostrap_page_newPWRepeat = '[style=""] > .labeled-input > input';
    private boostrap_page_checkAgreeEULA = '#checkbox-eula > .checkbox-container > .checkbox-custom';
    private boostrap_page_confirmLogin = '.btn > span';

    private home_page_mainMenu = '.menu';
    private home_page_virtualManagement = ':nth-child(7) > .option > div';

    private virtual_page_importButton = '.btn';
    private virtual_page_clusterName = ':nth-child(1) > .labeled-input > input';
    private virtual_page_createCluster = '.cru-resource-footer > div > .role-primary';
    

    // public registration_URL;

    /**
     * Rancher login page: Input username and password -> submit 
     */
     public firstTimeLogin() {
        cy.exec('cd $VAGRANT_PATH && vagrant ssh rancher_box -c "docker ps --format {{.ID}} | xargs docker logs 2>&1 | grep \'Bootstrap Password:\' | sed \'s/.*Password: //\'"', { env: { VAGRANT_PATH: constants.vagrant_pxe_path} }).then((result) => {
            // yields the 'result' object
            // {
            //   code: 0,
            //   stdout: "Files successfully built",
            //   stderr: ""
            // }
            // cy.log(result.stdout);

            // cy.log('Input bootstrap secret');
            cy.get(this.boostrap_page_boostrapPWInput).type(result.stdout).log('Input bootstrap secret');
            cy.get(this.boostrap_page_boostrapPWSubmit).click();

            // cy.log('Select a specific password to use')
            cy.get(this.boostrap_page_radioSelectPW).click().log('Select a specific password to use');

            // cy.log('Input new password')
            cy.get(this.boostrap_page_newPWInput).type(constants.rancher_password).log('Input new password');
            // cy.log('Confirm password again')
            cy.get(this.boostrap_page_newPWRepeat).type(constants.rancher_password).log('Confirm password again');

            // cy.log('Agree EULA')
            cy.get(this.boostrap_page_checkAgreeEULA).click().log('Agree EULA');

            // cy.log('Continue to access rancher')    
            cy.get(this.boostrap_page_confirmLogin).click().log('Continue to access rancher');
        })

    }

    /**
     * Rancher login page: Input username and password -> submit 
     */
     public login() {
        cy.get(this.login_page_usernameInput).type(constants.rancher_user).log('Input username');
        cy.get(this.login_page_passwordInput).type(constants.rancher_password).log('Input password');
        cy.get(this.login_page_loginButton).click().log('Login with local user');
    }

    /**
    * Check the rancher landing page is first time login or not
    */
     public rancherLogin() {

        cy.visit('/')
        cy.get('body').then($body => {
            if ($body.find('.info-box > :nth-child(1)').length) {   
              cy.log('First time login')
              this.firstTimeLogin();
              
            } else {
              cy.log('Not first time login')
              this.login();
            }
          
        })

        this.validateLogin()
        
    }

    /**
    * Validate correctly login to Rancher dashboard page
    */
     public validateLogin() {
        cy.get(this.main_page_title, { timeout: constants.timeout.maxTimeout })
        cy.url().should('contain', this.dashboardURL);
    }

    public importHarvester() {
        cy.visit('/home')
        cy.get(this.home_page_mainMenu).click();
        cy.get(this.home_page_virtualManagement).should('contain', 'Virtualization Management').click();
        cy.visit(constants.virtualManagePage)
        cy.get(this.virtual_page_importButton).should('contain', 'Import Existing').click();
        cy.get(this.virtual_page_clusterName).type('harvester')
        cy.get(this.virtual_page_createCluster).should('contain', 'Create').click();
        cy.visit(constants.virtualManagePage + '/create#memberRoles');
        let URL = '';

        cy.get('.copy').invoke('text').then((text) => {
            
            URL = text;
            cy.log(URL);
            // cy.log(text);
            // cy.task('setMyUniqueId', text)
            // let myUniqueId = text;
            
            // cy.task('setMyUniqueId', myUniqueId)
            // cy.wrap(rURL).as('rURL');
            // cy.log(text)
        });

        // cy.log(URL);

        // cy.then(() => {
        //     // var elmText = Cypress.$('code[class="copy m-10 p-10 has-tooltip"]').text()
        //     var elmText = Cypress.$('code#').text()
        //     cy.log(elmText)
        // })

        // cy.get('.copy').invoke('text').then(cy.log);
        // const url = cy.get('.copy').invoke('text');
        // return url;

        // let url = Cypress.$('[.copy]]').text()
        // cy.log(url)
        
        // return {
        //     url: +Cypress.$('.copy').text()
        // }
        
        // cy.get('.copy').then(($btn) => {
        //     const txt = $btn.text()
        //     cy.log(txt);
        //     // $btn is the object that the previous command yielded
        // })

        // cy.get('@rURL').should('contain', '192.168.0.34')

        // cy.get('.copy').then(($url) => {
        //     // cy.log(this.registration_URL)
        //     // this.registration_URL = text;
        //     const rURL = $url.text;
        //     return rURL;
        // });
        

        // const registration_URL = cy.get('@rURL')

        

        // cy.get('.copy').then(($copy) => {
        //     // cy.log($copy.text())
        //     return $copy.text()
        //     // this.registration_URL = $copy.text()
        //     // $btn is the object that the previous command yielded
        // })

        
        // cy.log(this.registration_URL)

        // cy.get('.copy').should(($copy) => {
        //     const txt = $copy.text()
        //     cy.log(txt)
        // })
    }
   
}
