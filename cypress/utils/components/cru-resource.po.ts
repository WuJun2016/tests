import cookie from 'cookie';

import PagePo from '@/utils/components/page.po';
import LabeledInputPo from '@/utils/components/labeled-input.po';
import LabeledSelectPo from '@/utils/components/labeled-select.po';

export default class CruResourcePo extends PagePo {
  /**
   * @param type: matches navigation url.
   * @param realType: matches api.
   * @param storeType: matches vuex.
   */
  constructor({ type, realType, storeType}:  {type: string, realType?: string, storeType?: string}) {
    super(`/harvester/c/local/${type}`);

    this.type = type
    this.realType = realType || type
    this.storeType = storeType || realType
  }

  public type = '';
  public realType = '';
  public storeType: string|undefined = undefined;
  public footerButtons = '.cru-resource-footer'
  public confirmRemove = '.card-container.prompt-remove'
  public searchInput = '.search'
  public actionMenu = '.list-unstyled.menu'
  public actionMenuIcon = '.icon-actions'

  namespace() {
    return new LabeledSelectPo('.labeled-select', `:contains("Namespace")`)
  }

  name() {
    return new LabeledInputPo('.span-3 >.labeled-input', `:contains("Name")`)
  }

  description() {
    return new LabeledInputPo('.labeled-input', `:contains("Description")`)
  }

  clickTab(contains: string) {
    const path = `.resource-container .side-tabs .tab#${contains}`
    cy.get(path).click()
  }

  clickFooterBtn(butText: string = 'save') {
    cy.get(this.footerButtons).find(`[data-testid="form-${butText}"]`).click()
  }

  goToCreatePage(buttonText: string = 'Create') {
    cy.get('.outlet .actions-container .actions').contains(buttonText).click();
  }

  public create(value: any, urlWithNamespace?: boolean) {
    cy.visit(`/harvester/c/local/${this.type}/create`)

    this.setValue(value)
    
    if (urlWithNamespace) {
      this.save(value.namespace)
    } else {
      this.save()
    }
  }

  public clone(id:string, value:any) {
    cy.visit(`/harvester/c/local/${this.type}/${id}?mode=clone`)

    this.setValue(value)

    this.save()
  }
  

  public save(namespace?:string | any) {
    if (namespace) {
      cy.intercept('POST', `/v1/harvester/${this.realType}s/${namespace}`).as('create');
    } else {
      cy.intercept('POST', `/v1/harvester/${this.realType}s`).as('create');
    }
    
    cy.get(this.footerButtons).contains('Create').click()
    cy.wait('@create').then(res => {
      expect(res.response?.statusCode, `Create ${this.type} success`).to.equal(201);
    })
  }

  public delete(namespace:string, name:string) {
    cy.visit(`/harvester/c/local/${this.type}`)

    this.clickAction(name, 'Delete')

    cy.intercept('DELETE', `/v1/harvester/${this.realType}s/${namespace}/${name}*`).as('delete');
    cy.get(this.confirmRemove).contains('Delete').click();
    cy.wait('@delete').then(res => {
      cy.window().then((win) => {
        this.checkDelete(this.storeType as string, `${namespace}/name`);
        expect(res.response?.statusCode, `Delete ${this.type}`).to.be.oneOf([200, 204]);
      })
    })
  }

  async deleteFromStore(id: string, realType: string=this.realType) {
    cy.window().then(async (win: any) => {
      try {
        const resource = await (win as any).$nuxt.$store.dispatch('harvester/find', { type: realType, id: id });
        await resource.remove();
        this.checkDelete(realType, id)
      } catch(e: any) {
        if (e.status === 404) {
          cy.log(`The resource ${realType} does not exist`)
        } else {
          cy.log(e.status)
        }
      }
    })
  }

  public checkDelete(type: string = this.type, id: string) {
    cy.window().then(async (win) => {
      let times = 0;
      await new Cypress.Promise((resolve, reject) => {
        const timer = setInterval(() => {
          times = times + 1;
          if (times > 40) {
            cy.log(`${type} can't removed from the backend`)
            reject()
          }

          const resource = (win as any).$nuxt.$store.getters['harvester/byId'](type, id);

          if (resource === undefined) {
            cy.log(`${type} has been removed from the backend`)
            clearInterval(timer);
            resolve()
          }
        }, 2000)
      })
    })
  }

  public deleteProgramlly(id:string, retries:number = 3) {
    cy.wrap(document.cookie).then(() => {
      const { CSRF } = cookie.parse(document.cookie);

      cy.request({
        url: `/v1/harvester/${this.realType}s/${ id }`,
        headers: {
          accept: 'application/json',
          'x-api-csrf': CSRF,
        },
        method: 'DELETE',
      }).then(res => {
        expect(res.status, `Delete ${this.type}`).to.be.oneOf([200, 204]);
      })
    })
  }

  setNameNsDescription(name: string, ns: string, description?: string) {
    this.namespace().select({ option: ns })
    this.name().input(name)
    this.description().input(description)
  }

  public setValue(value: any) {
    this.namespace().select({option: value?.namespace})
    this.name().input(value?.name)
    this.description().input(value?.description)
  }

  public update(id:string, type?: string) {
    const _type = type || this.realType
    cy.intercept('PUT', `/v1/harvester/${_type}s/${id}`).as('update');
    cy.get(this.footerButtons).contains('Save').click()
    cy.wait('@update').then(res => {
      expect(res.response?.statusCode, `Check edit ${id}`).to.equal(200);
    })
  }

  public clickAction(name:string, action: string) {
    cy.get(this.searchInput).type(name)
    const record = cy.contains(name)
    expect(record.should('be.visible'))
    record.parentsUntil('tbody', 'tr').find(this.actionMenuIcon).click()
    return cy.get(this.actionMenu).contains(action).click()
  }

  public checkEdit(name:string, namespace?:string, value?:any, action:string = 'Edit Config') {
    this.clickAction(name, action)
  
    this.setValue(value)
    
    if (namespace) {
      this.update(`${namespace}/${name}`)
    } else {
      this.update(`${name}`)
    }
  }

  public checkClone(name:string, namespace?:string, value?:any, action:string = 'Clone') {
    this.clickAction(name, action)
  
    this.setValue(value)
    
    this.save()
  }

  public goToList() {
    cy.intercept('GET', `/v1/harvester/${this.realType}s`).as('goToList');
    cy.visit(`/harvester/c/local/${this.type}`)
    cy.wait('@goToList');
  }
}
