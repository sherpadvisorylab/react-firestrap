import React from "react";
import FieldModels from "../models/FieldModels";
import ViewModels from "../models/ViewModels";
import BlockModels from "../models/BlockModels";
import SectionModels from "../models/SectionModel";
import WidgetModels from "../models/WidgetModels";

// Definition generic
export interface FieldDefinition<TDefaults> {
    defaults: (key: string) => TDefaults;
    editor: (key: string) => React.ReactNode;
}

// FieldFactory generic
export type FieldFactory<TDefaults> = (defaults: TDefaults) => FieldDefinition<TDefaults>;

const Models = {
    field: FieldModels,
    view: ViewModels,
    block: BlockModels,
    section: SectionModels,
    widget: WidgetModels,
}

export default Models;
