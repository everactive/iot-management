/*
 * This file is part of the IoT Management Service
 * Copyright 2019 Canonical Ltd.
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License version 3, as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranties of MERCHANTABILITY,
 * SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, {Component} from 'react';
import moment from 'moment';
import AlertBox from './AlertBox';
import If from './If';
import {T} from './Utils';
import api from '../models/api';


class Device extends Component {

    constructor(props) {
        super(props)
        this.state = {
            userTo: null,
            users: []
        }
    }

    renderActions() {
        if ((!this.props.actions) || (this.props.actions.length===0)) {
            return <p>{T('no-actions')}</p>
        }

        return (
            <table className="p-card__content">
                <thead>
                    <tr>
                        <th className="small">{T('created')}</th>
                        <th className="small">{T('modified')}</th>
                        <th className="small">{T('action')}</th>
                        <th className="small">{T('status')}</th>
                        <th className="overflow">{T('result')}</th>
                    </tr>
                </thead>
                <tbody>
                {this.props.actions.map(a => {
                    return (
                        <tr>
                            <td>{moment(a.created).format('llll')}</td>
                            <td>{moment(a.modified).format('llll')}</td>
                            <td>{a.action}</td>
                            <td>{a.status}</td>
                            <td>{a.message}</td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        )
    }

    handleShowAddSshUser = (e) => {
        e.preventDefault();
        api.usersList().then(response => {
            this.setState({users: response.data.users})
        })
        this.setState({sshDialog: true})
    }

    handleUserChange = (e) => {
        e.preventDefault();
        this.setState({userTo: e.target.value})
    }
    handleSshUserAdd = (e) => {
        e.preventDefault();
        if (!this.state.userTo) {
            return
        }
        var u = this.state.users[this.state.userTo]
        var d = this.props.client.device
        var settings = {
            "action": "create",
            "email": u.email,
            "username": u.username,
            "sudoer": true,
            "force-managed": true,
        }
        api.deviceUsersAction(d.orgId, d.deviceId, JSON.stringify(settings)).then(response => {
            this.setState({message: "Sent request to add ssh user " + u.username})
            this.setState({sshDialog: null})
        });
    }

    handleSshUserRemove = (e) => {
        e.preventDefault();
        if (!this.state.userTo) {
            return
        }
        var u = this.state.users[this.state.userTo]
        var d = this.props.client.device
        var settings = {
            "action": "remove",
            "username": u.username
        }
        api.deviceUsersAction(d.orgId, d.deviceId, JSON.stringify(settings)).then(response => {
            this.setState({message: "Sent request to remove ssh user " + u.username})
            this.setState({sshDialog: null})
        });
    }


    handleSshUserCancel = (e) => {
        e.preventDefault();
        this.setState({sshDialog: null})
    }

    render () {
        var d = this.props.client;
        if (!d.device) {return <div>Loading...</div>};

        return (
            <div className="row">
                <section>
                    <div>
                        <h1 className="tight">{d.device.brand} {d.device.model}
                        </h1>
                        <h4 className="subtitle">{d.device.serial}</h4>
                    </div>
                </section>
                <section className="row spacer">
                    <div className="col-12">
                        <AlertBox message={this.props.message} />
                        <AlertBox message={this.state.message} type="information"/>
                    </div>
                </section>
                <section className="row spacer">
                <div>
                    <button className="p-button--neutral small u-float" title={T('Edit SSH User')} onClick={this.handleShowAddSshUser}>
                        <i className="fa fa-user" aria-hidden="true"/>
                    </button>
                </div>
                </section>

                <If cond={this.state.sshDialog}>
                <section className="row spacer">
                    <div className="p-card">
                        <h3 className="p-card__title">{T('SSH User Add')}</h3>
                        <form>
                            <fieldset>
                                <label>
                                    {T('Add SSH User')}
                                    <select value={this.state.userTo} id="userId" onChange={this.handleUserChange}>
                                        <option></option>
                                        {this.state.users.map((u, i) => {
                                            return <option key={u.id} value={i}>{u.username}: {u.email}</option>
                                        })}                                     
                                    </select>
                                </label>
                            </fieldset>
                            <button className="p-button--brand" onClick={this.handleSshUserAdd}>{T('Add')}</button>
                            <button className="p-button--brand" onClick={this.handleSshUserRemove}>{T('Remove')}</button>
                            <button className="p-button--brand" onClick={this.handleSshUserCancel}>{T('cancel')}</button>
                        </form>
                    </div>
                </section>
                </If>

                <If cond={!this.props.message}>
                    <section className="row spacer">
                        <div className="p-card--highlighted col-6">
                            <table className="p-card__content">
                                <tbody>
                                    <tr>
                                        <td>{T('last-update')}:</td><td>{moment(d.device.lastRefresh).format('llll')}</td>
                                    </tr>
                                    <tr>
                                        <td>{T('registered')}:</td><td>{moment(d.device.created).format('llll')}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="row spacer">
                        <div className="p-card">
                            <h3 className="p-card__title">{T('system-info')}</h3>
                            <table className="p-card__content">
                                <tbody>
                                    <tr>
                                        <td>{T('model')}:</td><td>{d.device.brand} {d.device.model}</td>
                                    </tr>
                                    <tr>
                                        <td>{T('serial-number')}:</td><td>{d.device.serial}</td>
                                    </tr>
                                    <tr>
                                        <td>{T('os-version')}:</td><td>{d.device.version.osId} {d.device.version.osVersionId}</td>
                                    </tr>
                                    <tr>
                                        <td>{T('series')}:</td><td>{d.device.version.series}</td>
                                    </tr>
                                    <tr>
                                        <td>{T('version')}:</td><td>{d.device.version.version}</td>
                                    </tr>
                                    <tr>
                                        <td>{T('kernel-version')}:</td><td>{d.device.version.kernelVersion}</td>
                                    </tr>
                                    <tr>
                                        <td>{T('on-classic')}:</td><td>{d.device.version.onClassic ? 'true': 'false'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="row spacer">
                        <div className="p-card">
                            <h3 className="p-card__title">{T('actions')}</h3>
                            {this.renderActions()}
                        </div>
                    </section>

                </If>
            </div>



        )
    }
}

export default Device
