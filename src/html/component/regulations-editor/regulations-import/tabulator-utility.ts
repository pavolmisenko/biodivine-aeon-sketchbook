import {
  AjaxModule,
  EditModule,
  FilterModule,
  FormatModule,
  InteractionModule,
  MenuModule,
  type Options,
  PageModule,
  ReactiveDataModule,
  ResizeColumnsModule,
  SelectRowModule,
  SortModule,
  Tabulator,
} from "tabulator-tables";

export const tabulatorOptions: Options = {
  layout: "fitData",
  pagination: true,
  renderVerticalBuffer: 300,
  sortMode: "local",
  initialSort: [
    {
      column: "Source Entity",
      dir: "asc",
    },
  ],
  rowClickMenu: [
    {
      label: "Delete Row",
      action: function (_, row) {
        row.delete();
      },
    },
  ],
};

export const loadTabulatorPlugins = (): void => {
  Tabulator.registerModule(SortModule);
  Tabulator.registerModule(EditModule);
  Tabulator.registerModule(PageModule);
  Tabulator.registerModule(FilterModule);
  Tabulator.registerModule(SelectRowModule);
  Tabulator.registerModule(FormatModule);
  Tabulator.registerModule(InteractionModule);
  Tabulator.registerModule(AjaxModule);
  Tabulator.registerModule(MenuModule);
  Tabulator.registerModule(ResizeColumnsModule);
  Tabulator.registerModule(ReactiveDataModule);
};
