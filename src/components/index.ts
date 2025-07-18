import React from 'react';

export type ChangeHandler = React.ChangeEvent<any> | { target: { name: string; value?: any } };

  
export interface UIProps {
    pre?: React.ReactNode;
    post?: React.ReactNode;
    wrapClass?: string;
    className?: string;
}

export interface FormFieldProps extends UIProps {
    name: string;
    label?: string;
    value?: any;
    required?: boolean;
    onChange?: (event: ChangeHandler) => void;
}

export { default as Brand } from './blocks/Brand';
export { default as Breadcrumbs } from './blocks/Breadcrumbs';
export { default as Carousel } from './blocks/Carousel';
export * from './blocks/Dropdown';
export { default as Notifications } from './blocks/Notifications';
export { default as Search } from './blocks/Search';

export { default as Alert } from './ui/Alert';
export { default as Badge } from './ui/Badge';
export * from './ui/Buttons';
export { default as Card } from './ui/Card';
export { default as Gallery} from './ui/Gallery';
export * from './ui/GridSystem';
export { default as Image } from './ui/Image';
export { default as ImageAvatar } from './ui/ImageAvatar';
export { default as Loader } from './ui/Loader';
export { default as Modal } from './ui/Modal';
export * from './ui/Modal';
export { default as Percentage } from './ui/Percentage';
export { default as Percentage2 } from './ui/Percentage2';
export { default as Repeat } from './ui/Repeat';
export { default as TabDynamic } from './ui/TabDynamic';
export { default as Tab } from './ui/Tab';
export * from './ui/Tab';
export { default as Table } from './ui/Table';
export { default as Icon } from './ui/Icon';

export * from './ui/fields/Input';
export * from './ui/fields/Select';
export * from './ui/fields/Upload';
export * from './ui/fields/Crop';
export * from './ui/fields/FileCSVUploader';

export { default as AssistantAI } from './ui/fields/AssistantAI';
export { default as Menu } from './blocks/Menu';

export { default as Form } from './widgets/Form';
export { default as Grid } from './widgets/Grid';
export { default as ImageEditor } from './widgets/ImageEditor';
export { asForm} from './FormEnhancer';
export { default as Component } from './Component';
export { ComponentBlock } from './Component';
export * from './Template';

