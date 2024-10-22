declare module 'react-firestrap' {
    export interface MyComponentProps {
        title: string;
        onClick: () => void;
    }

    export class MyComponent extends React.Component<MyComponentProps> {}

    export function myFunction(param: string): number;
}
