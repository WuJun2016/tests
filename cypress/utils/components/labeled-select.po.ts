import ComponentPo from './component.po';

export default class LabeledSelectPo extends ComponentPo {
  select(option: string | undefined) {
    if (option) {
      this.self().click()
      cy.contains(option).click()
    }

    return
  }
}
