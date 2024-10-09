import React from 'react';

function Repeat({children}) {
    const handleRemove = () => {

    }


    return (<div className={""}>
        <div className={"p-4 border position-relative"}>
            <div className={"d-flex justify-content-between mb-2"}>
                <h6>cccc</h6>
                <button className={""}
                        onClick={() => handleRemove()}>x
                </button>
            </div>

            {children}
        </div>
    </div>);
}

export default Repeat;