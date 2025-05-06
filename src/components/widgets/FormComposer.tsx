import React from "react";
import Form, { FormProps } from "./Form";
import { String, Number, Email, TextArea, Date, Time, DateTime, Checkbox, DateInput, SwitchInput, ListGroup } from "../ui/fields/Input";
import { Autocomplete, Checklist, Select } from "../ui/fields/Select";
import Upload from "../ui/fields/Upload";
import Alert from "../ui/Alert";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import Gallery from "../ui/Gallery";
import { Col, Container, Row, Wrapper } from "../ui/GridSystem";
import Image from "../ui/Image";
import ImageAvatar from "../ui/ImageAvatar";
import Loader from "../ui/Loader";
import Percentage from "../ui/Percentage";
import Repeat from "../ui/Repeat";
import Tab from "../ui/Tab";
import Tab2 from "../ui/Tab2";
import Table from "../ui/Table";
import Brand from "../blocks/Brand";
import Breadcrumbs from "../blocks/Breadcrumbs";
import Carousel from "../blocks/Carousel";
import { Dropdown, DropdownButton, DropdownLink } from "../blocks/Dropdown";
import Notifications from "../blocks/Notifications";
import Search from "../blocks/Search";

type FieldMap = { [key: string]: React.ReactNode };

interface FormComposerProps extends Omit<FormProps, 'children'> {
    model: { [key: string]: any };
    layout?: (fields: FieldMap) => React.ReactNode;
}

type FieldType =
    | 'image'
    | 'string'
    | 'email'
    | 'number'
    | 'textarea'
    | 'date'
    | 'time'
    | 'datetime'
    | 'dateinput'
    | 'checkbox'
    | 'switch'
    | 'listgroup'
    | 'select'
    | 'autocomplete'
    | 'checklist'
    | 'upload'
    | 'alert'
    | 'badge'
    | 'card'
    | 'gallery'
    | 'wrapper'
    | 'container'
    | 'row'
    | 'col'
    | 'imageAvatar'
    | 'loader'
    /* | 'modal' */
    | 'percentage'
    | 'repeat'
    | 'tab'
    | 'tab2'
    | 'table'
    | 'brand'
    | 'breadcrumbs'
    | 'carousel'
    | 'dropdown'
    | 'dropdownLink'
    | 'dropdownButton'
    | 'notifications'
    | 'search'
    ;
type FieldEntry = {
    type: FieldType;
    [key: string]: any;
};

const renderField = ({
    key,
    entry,
}: {
    key: string;
    entry: FieldEntry;
}): React.ReactNode => {
    const wrap = (suffix: string) => `${key}:${suffix}`;

    const components: Record<FieldType, React.ReactNode> = {
        image: (
            <>
                <String name={wrap("src")} label="Image source" />
                <String name={wrap("alt")} label="Alt text" />
                <Number name={wrap("width")} label="Width" value={entry.width} />
                <Number name={wrap("height")} label="Height" value={entry.height} />
            </>
        ),
        string: <String name={key} label={key} />,
        email: <Email name={key} label={key} />,
        number: <Number name={key} label={key} />,
        textarea: <TextArea name={key} label={key} />,
        date: <Date name={key} label={key} />,
        time: <Time name={key} label={key} />,
        datetime: <DateTime name={key} label={key} />,
        dateinput: <DateInput placeholder="" onChange={() => { }} />,
        checkbox: <Checkbox name={key} label={key} />,
        switch: <SwitchInput label={key} onChange={() => { }} status={entry.status} />,
        listgroup: <ListGroup items={entry.items} onClick={() => { }} />,
        select: <Select name={key} label={key} options={entry.options} />,
        autocomplete: <Autocomplete name={key} label={key} options={entry.options} />,
        checklist: <Checklist name={key} label={key} options={entry.options} />,
        upload: <Upload name={key} label={key} />,

        alert: <Alert children={entry.children} />,
        badge: <Badge children={entry.children} />,
        card: <Card children={entry.children} />,
        gallery: <Gallery body={[entry.body]} />,

        wrapper: <Wrapper className={entry.className}>{entry.children}</Wrapper>,
        container: <Container className={entry.className}>{entry.children}</Container>,
        row: <Row className={entry.className}>{entry.children}</Row>,
        col: <Col className={entry.className} defaultSize={entry.defaultSize} xxl={entry.xxl} xl={entry.xl} lg={entry.lg} md={entry.md} sm={entry.sm} xs={entry.xs}>{entry.children}</Col>,

        /* image: <Image src={entry.src} alt={entry.alt} width={entry.width} height={entry.height} className={entry.className} title={entry.title} />, */
        imageAvatar: <ImageAvatar src={entry.src} alt={entry.alt} width={entry.width} height={entry.height} className={entry.className} title={entry.title} />,
        loader: <Loader children={entry.children} />,
        /*Modal*/
        percentage: <Percentage min={entry.min} max={entry.max} val={entry.val} children={entry.children} styleType={entry.styleType} />,
        repeat: <Repeat children={entry.children} />,
        tab: <Tab children={entry.children} min={entry.min} label={entry.label} tabPosition={entry.tabPosition} />,
        tab2: <Tab2 items={entry.items}/>,
        table: <Table header={entry.header} body={entry.body} />,

        brand: <Brand url={entry.url} src={entry.src} label={entry.label}/>,
        breadcrumbs: <Breadcrumbs pre={entry.pre} />,
        carousel: <Carousel
                      showIndicators={entry.showIndicators}
                      showControls={entry.showControls}
                      showCaption={entry.showCaption}
                      layoutDark={entry.layoutDark}
                      autoPlay={entry.autoPlay}
                      startSlide={entry.startSlide}
                      children={entry.children}
                    />,
        dropdown: <Dropdown
                      icon={entry.icon}
                      label={entry.label}
                      header={entry.header}
                      footer={entry.footer}
                      keepDropdownOpen={entry.keepDropdownOpen}
                      children={entry.children}
                    />,
        dropdownLink: <DropdownLink url={entry.url} children={entry.children} onClick={entry.onClick}/>,
        dropdownButton: <DropdownButton url={entry.url} children={entry.children}/>,

        notifications: <Notifications badge={entry.badge} children={entry.children} />,
        search: <Search/>
    };

    return components[entry.type] ?? <></>;
};


export function FormComposer({
    model,
    layout = (fields) => <>{Object.values(fields)}</>, // default layout
    ...formProps
}: FormComposerProps
) {
    const children = React.useMemo(() => {
        if (!model || !layout) return null;

        return layout(Object.entries(model).reduce((acc: FieldMap, [key, entry]) => {
            acc[key] = renderField({ key, entry });
            return acc;
        }, {} as FieldMap));
    }, [model, layout]);

    return <Form {...formProps}>{children}</Form>;
}


export default FormComposer;