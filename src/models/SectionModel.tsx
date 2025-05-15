import React from "react";
import {FieldFactory} from "../components/Models";

export interface SectionModelsMap {
    topbar: FieldFactory<{ logo ?:string, menu ?: any, profile ?:any }>;
}

const SectionModels: SectionModelsMap = {
    topbar: ({ logo, menu, profile } = {}) => ({
        getDefaults: (key) => ({
            [`${key}:logo`]: logo,
            [`${key}:menu`]: menu,
            [`${key}:profile`]: profile
        }),
        renderForm: (key) => <>{key} Coming soon...</>
    })
};

export default SectionModels;