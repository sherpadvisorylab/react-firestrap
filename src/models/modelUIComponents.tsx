import {Container, Wrapper, Row, Col} from "../components/ui/GridSystem";

export interface uiComponentsModels {
    container: typeof Container;
    wrapper: typeof Wrapper;
    row: typeof Row;
    col: typeof Col;
}

const modelUIComponents: uiComponentsModels = {
    container: Container,
    wrapper: Wrapper,
    row: Row,
    col: Col
};

export default modelUIComponents;