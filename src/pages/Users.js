import React from "react";
import Grid from "../components/Grid.js";
import {String, Email} from "../components/Input.js";
import {Select} from "../components/Select.js";

function Users() {
  return (
    <Grid
        dataStoragePath={"/users"}
        setPrimaryKey={(record) => record.email.replace('@', '-')}
        Form={<>
            <String name={"username"}
                    label={"Username"}
            />
            <Email name={"email"}
                   label={"Email"}
                   required={true}
                   updatable={false}
            />
            <Select name={"permission"}
                    label={"Permission"}
                    options={[
                        {value: "admin", label: "Admin"},
                        {value: "user", label: "User"},
                    ]}
                    required={true}
            />
        </>}
    />
  );
}

export default Users;