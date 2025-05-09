import React from "react";
import InputModels from "../models/InputModels";
import ViewModels from "../models/ViewModels";
import BlockModels from "../models/BlockModels";
import SectionModels from "../models/SectionModel";
import WidgetModels from "../models/WidgetModels";

export interface FieldDefinition<TDefaults> {
    defaults: (key: string) => TDefaults;
    form: (key: string) => React.ReactNode;
}
export type FieldFactory<TDefaults = {}> = (defaults?: TDefaults) => FieldDefinition<TDefaults>;

const Models = {
    input: InputModels,
    ui: ViewModels,
    block: BlockModels,
    section: SectionModels,
    widget: WidgetModels,
}

export default Models;
