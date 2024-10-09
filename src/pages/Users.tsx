import React from "react";
import Grid from "../components/Grid";
import {String, Email} from "../components/Input";
import {Select} from "../components/Select";

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