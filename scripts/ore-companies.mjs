class CompanyModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.SchemaField({
        long: new fields.HTMLField({ required: false, blank: true }),
        short: new fields.HTMLField({ required: false, blank: true }),
      }),
      img: new fields.FilePathField({ required: false, categories: ["IMAGE"] }),
      steps: new fields.ArrayField(new fields.StringField({ blank: true })),
    };
  }
  prepareDerivedData() {
    this.nSteps = this.steps.length;
  }
}

class CompanyActorSheet extends ActorSheet {
  get template() {
    return `modules/ore-companies/templates/company.hbs`;
  }
  async getData(options = {}) {
    const context = await super.getData(options);
    context.description = {
      long: await TextEditor.enrichHTML(this.object.system.description.long, {
        async: true,
        secrets: this.object.isOwner,
        relativeTo: this.object,
      }),
      short: await TextEditor.enrichHTML(this.object.system.description.short, {
        async: true,
        secrets: this.object.isOwner,
        relativeTo: this.object,
      }),
    };
    return context;
  }
}

///Hooks///

Hooks.once("init", function () {
  console.log("Initializing ore-companies");
  //pf2e custom actor behavior
  if (game.system.id === "pf2e") {
    const ActorPF2e = Object.getPrototypeOf(
      CONFIG.PF2E.Actor.documentClasses.loot
    );
    class CompanyActor extends ActorPF2e {
      prepareBaseData() {}
      prepareDerivedData() {}
      prepareData() {}
      //_safePrepareData() {}
    }
    CONFIG.PF2E.Actor.documentClasses["ore-companies.company"] = CompanyActor;
  }
  //general initialization
  // document
  DocumentSheetConfig.registerSheet(Actor, "ore-companies", CompanyActorSheet, {
    types: ["ore-companies.company"],
    makeDefault: true,
  });
  // data
  Object.assign(CONFIG.Actor.dataModels, {
    "ore-companies.company": CompanyModel,
  });
});

Hooks.on("createActor", (actor, options, userId) => {
  console.log(`Actor of type ${actor.type} created with name ${actor.name}`);
});

Hooks.on("updateActor", (actor, updateData, options, userId) => {
  if (updateData.name) {
    console.log(`Actor's name changed to ${updateData.name}`);
  }
});
