import { Constants } from '../constants/constants'
const constants = new Constants();

export class SettingsPage {
    private uiSourceButton = '#ui-source';
    private editSettingsButton = '.icon-edit';
    private settingsDropdown = '.labeled-select';
    private listBox = '[role="listbox"]';

    /**
     * Visits the Advanced Settings page and checks URL
     */
    public visitSettings() {
        cy.visit(constants.settingsUrl).then(() => {
            this.validateSettingsUrl();
        });
    }
    /**
     * visits advanced settings page and opens the edit ui source page. Then it checks the URL
     */
    public editUiSource() {
        cy.visit(constants.settingsUrl);
        expect(cy.url().should('eq', constants.settingsUrl) );
        cy.get(this.uiSourceButton).click();
        cy.get(this.editSettingsButton).click();;
        expect(cy.url().should('eq', constants.uiSourceUrl) );
    }
    /**
         * @param type this is the type of ui source type
         * @value 0 This is Auto
         * @value 1 This is External
         * @value 2 This is Bundled
     */
    public changeUiSourceType(type: number) {
        this.editUiSource();
        cy.get(this.settingsDropdown).click();
        // This iterates through the list of options and matches it to the type.
        // If the order changes then we will need to change this
        this.selectFromDropdown(type);
        cy.get('.btn').contains('Save').click();
        this.validateSettingsUrl();
    }
    /**
     * Selects the selection by index from the listbox element
     * @param selection selection is the index array that you want to select from the list
     */
    private selectFromDropdown(selection: number) {
        cy.get(this.listBox).within(() => {
            cy.get('li').each(($elem, index) => {
                if(index === selection) {
                    cy.wrap($elem).click();
                }
            });
        });

    }
    /**
     * This validates that you are on the advanced settings URL
     */
    private validateSettingsUrl() {
        expect(cy.url().should('eq', constants.settingsUrl));
    }
}