/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */

const iotsdk = require('aws-iot-device-sdk-v2');
const mqtt = iotsdk.mqtt;
const TextDecoder = require('util').TextDecoder;
const yargs = require('yargs');
const common_args = require("C:\\Users\\pogliani.mattia\\Desktop\\Programmi\\pub_sub_js\\util\\cli_args.js");

yargs.command('*', false, (yargs) => {
    common_args.add_connection_establishment_arguments(yargs);
    common_args.add_pub_sub_arguments(yargs)
}, main).parse();

async function execute_session(connection, argv) {
    return new Promise(async (resolve, reject) => {
        try {
            const decoder = new TextDecoder('utf8');
            const printMessage = async (topic, payload,) => {
                const json = decoder.decode(payload);
                console.log(`Publish received. topic:"${topic}"`);
                console.log(json);
            }

            await connection.subscribe(argv.topic, mqtt.QoS.AtLeastOnce, printMessage);

            
        }
        catch (error) {
            reject(error);
        }
    });
}

async function main(argv) {
    console.log(argv)
    common_args.apply_sample_arguments(argv);

    const connection = common_args.build_connection_from_cli_args(argv);

    // force node to wait 60 seconds before killing itself, promises do not keep node alive
    // ToDo: we can get rid of this but it requires a refactor of the native connection binding that includes
    //    pinning the libuv event loop while the connection is active or potentially active.
    const timer = setInterval(() => {}, 60 * 1000);

    await connection.connect();
    await execute_session(connection, argv);
    await connection.disconnect();

    // Allow node to die if the promise above resolved
    clearTimeout(timer);
}
