export { default } from '../integrations/google/firedatabase';


/*
let db = null;
const load = (integrationName = null) => {
    console.log("ASDSASDDASDASDASDASD");
    try {
        switch (integrationName) {
            case 'dynamoDb':
                db = import('../integrations/aws/dynamoDb.js');
                break;
            case 'firebase':
            default:
                db = import('../integrations/google/firedatabase.js');
        }

        console.log(`Database configured with: ${integrationName}`);
    } catch (error) {
        console.error('Failed to configure database:', error);
        throw error;
    }
};

export const database = () => {
    return db || load();
};

export default database;

 */
