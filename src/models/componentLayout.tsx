import {Container, Wrapper, Row, Col} from "../components/ui/GridSystem";

export interface ComponentLayoutMap  {
    container: typeof Container;
    wrapper: typeof Wrapper;
    row: typeof Row;
    col: typeof Col;
}

const componentLayout: ComponentLayoutMap  = {
    container: Container,
    wrapper: Wrapper,
    row: Row,
    col: Col
};

export default componentLayout;