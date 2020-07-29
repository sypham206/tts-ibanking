import React from 'react';
import DB from '../database/index';
import {connector} from "./../../callAxios";
import {AiOutlineDelete} from "react-icons/ai";
import {MdPayment} from "react-icons/md";
import {FcAddDatabase} from "react-icons/fc"
import {FaRegEdit} from "react-icons/fa";
import {
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    Card,
    Col,
    Row,
    Table,
    CardBody,
    CardHeader,
    TabContent,
    TabPane,
    NavItem,
    NavLink,
    Nav
} from "reactstrap";
import {lightBaseTheme} from 'material-ui/styles';

export default class debtsComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeTab: 0,
            numberReceiver: null,
            nameReceiver: '',
            money: null,
            message: '',
            code: '125765',
            time: Date('05052020'),
            listDebts1: [],
            listDebts2: [],
            listReceivers: [],
            loaded: false,
            timeout: new Date().getTime() + 10 * 1000
        }
        this.onChange = this.onChange.bind(this);
        this.selectReceiverChange = this.selectReceiverChange.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.ActionAdd = this.ActionAdd.bind(this);
        this.getDatabase = this.getDatabase.bind(this);
        this.ActionCancel1 = this.ActionCancel1.bind(this);
        this.ActionCancel2 = this.ActionCancel2.bind(this);


    }
    onChange(e) {
        this.setState({[e.target.name]: e.target.value})
        // Nếu sự kiện ở thẻ Input Account Receiver thì thay đổi giá trị Name Receiver và làm rỗng thẻ gợi ý
        if (e.target.name == "numberReceiver") {
            let nameReceiver = '';
            DB.listReceivers().forEach(element => {
                if (element.number == e.target.value && element.bankCode == "GO") {
                    nameReceiver = element.name;
                }
            });
            this.setState({ // Cập nhật Name Receiver
                nameReceiver: nameReceiver
            })
            // value = 0 ứng với option gợi ý (dòng 155)
            document.getElementById('selectReceiver').value = '0';
        }
    }

    selectReceiverChange = async (e) => {
        const numberReceiver = e.target.value;
        let nameReceiver;
        // Call axios
        const response = await connector.get(`/account/${numberReceiver}`, {}).then((response) => {
            console.log("response", response);
            if (response.data.status == 'OK') {
                nameReceiver = response.data.fullname;
            }
            // Lưu vào state
            this.setState({nameReceiver: nameReceiver, numberReceiver: numberReceiver})
        }, (error) => {
            console.log("Error! Infor: ", error.response);
            alert('Lỗi xảy ra!');
        });
    }

    setActiveTab(val) {
        this.setState({activeTab: val})
    }

    ActionPay(e) {
        e.preventDefault();
        alert('Thanh toán nhắc nợ');
    }

    ActionCancel1 = async (id) => {
        alert(id);
        let reqBody = {
            creditor_account_number: '',
            debtor_account_number: '',
            money: '',
            notify_message: 'Xóa thôi ai biết đâu :('
        }
        this.state.listDebts1.forEach(element => {
            if (id == element.debt_id) {
                reqBody = {
                    creditor_account_number: element.creditor_account_number,
                    debtor_account_number: element.debtor_account_number,
                    money: element.money,
                    notify_message: 'Xóa thôi ai biết đâu :('
                }

            }                
        });

        // Call axios
        const response = await connector.post(`/debt/delete1/${id}`, reqBody).then((response) => {
            console.log("response", response);

            // Lưu vào state
            this.setState({loaded: true})
        }, (error) => {
            console.log("Error! Infor: ", error.response);
            alert('Lỗi xảy ra!');
        });
    }

    ActionCancel2 = async (id) => {
        alert(id);
        // Call axios
        const reqBody = {
            notify_message: 'Xóa thôi ai biết đâu :('
        }
        const response = await connector.post(`/debt/delete2/${id}`, reqBody).then((response) => {
            console.log("response", response);

            // Lưu vào state
            this.setState({loaded: false})
        }, (error) => {
            console.log("Error! Infor: ", error.response);
            alert('Lỗi xảy ra!');
        });


    }

    ActionAdd(e) {
        e.preventDefault();
        this.setState({activeTab: 0});
        const {formID} = document.forms;
        formID.reset();
        document.getElementById('formAdd').style.display = "block";
        document.getElementById('formAdd').focus();

    }

    submitForm = async (e) => {
        e.preventDefault()
        // Thực hiện gửi nhắc nợ
        const reqBody = {
            debtor_account_number: this.state.numberReceiver,
            money: this.state.money,
            message: this.state.message
        }
        const response = await connector.post(`/debt/create`, reqBody).then((response) => {
            console.log("response", response);
            if (response.data.status == 'OK') {
                this.setState({code: response.data.debt_id})
            }
        }, (error) => {
            console.log("Error! Gửi nhắc nợ: ", error.response);
            alert('Lỗi gửi nhắc nợ!');
        });

        // Chuyển qua màn hình thông báo
        this.setState({activeTab: 1});
    }


    ActionCancelForm(e) {
        e.preventDefault();
        document.getElementById('formAdd').style.display = "none";
        // document.getElementById('main').style.display = "block";

    }

    getDatabase = async (e) => { // Refresh token để gọi backend trước
        this.setState({loaded: true})
        DB.refreshToken();
        // Call axios
        const response = await connector.get("/list-receiver1", {}).then((response) => {
            console.log("response", response);
            let listReceivers = [{
                    remind_name: "Chọn tài khoản gợi nhớ",
                    number: "0",
                    bankCode: "0"
                }];
            response.data.forEach(element => {
                listReceivers = listReceivers.concat([{
                        remind_name: element.remind_name,
                        number: element.receiver_account_number,
                        bankCode: element.bank_code
                    }]);
            });

            // Lưu vào state
            this.setState({listReceivers: listReceivers})
        }, (error) => {
            console.log("Error! Infor: ", error.response);
            alert('Lỗi xảy ra!');
        });
        const response1 = await connector.get("/debt/view1", {}).then((response) => {
            console.log("response", response);
            let listDebts1 = [];
            response.data.forEach(element => {
                listDebts1 = listDebts1.concat([{
                        id: element.debt_id,
                        code: element._id,
                        number: element.debtor_account_number,
                        name: element.debtor_fullname,
                        money: element.money,
                        content: element.message,
                        time: element.created_at
                    }]);
            });

            // Lưu vào state
            this.setState({listDebts1: listDebts1})
        }, (error) => {
            console.log("Error! Infor: ", error.response);
            alert('Lỗi xảy ra (view1)!');
        });
        const response2 = await connector.get("/debt/view2", {}).then((response) => {
            console.log("response", response);
            let listDebts2 = [];
            response.data.forEach(element => {
                listDebts2 = listDebts2.concat([{
                        id: element.debt_id,
                        code: element._id,
                        number: element.creditor_account_number,
                        name: element.creditor_fullname, // lỗi thiếu db, đúng ra là creditor_fullname
                        money: element.money,
                        content: element.message,
                        time: element.created_at
                    }]);
            });

            // Lưu vào state
            this.setState({listDebts2: listDebts2})
        }, (error) => {
            console.log("Error! Infor: ", error.response);
            alert('Lỗi xảy ra (view2)!');
        });
    }

    render = () => { // Realtime
        if (new Date().getTime() > this.state.timeout || this.state.loaded == false) { // Cập nhật DB mới và khởi tạo lại timeout
            this.setState({
                timeout: new Date().getTime() + 10 * 1000
            });
            this.getDatabase();
        } else { // Chạy với mục đích dùng setState để chạy lại render()
            setTimeout(function () {
                this.setState({loaded: true});
            }.bind(this), 10 * 1000);
        }

        // Tải lên giao diện
        return (
            <div>
                <div id={'main'}>
                    <Card style={
                        {borderStyle: 'none'}
                    }>
                        <CardHeader style={
                            {
                                backgroundColor: '#435d7d',
                                textAlign: 'center',
                                color: 'white',
                                fontSize: '18px'
                            }
                        }>
                            <strong>Quản lý nhắc nợ</strong>
                        </CardHeader>
                        <CardBody style={
                            {
                                borderStyle: 'ridge',
                                borderColor: '#435d7d'
                            }
                        }>
                            <FormGroup row>
                                <Col xs="12" md="6">
                                    <Nav tabs>
                                        <NavItem>
                                            <NavLink active={
                                                    this.state.activeTab === 0
                                                }
                                                onClick={
                                                    () => this.setActiveTab(0)
                                            }>
                                                <b style={
                                                    {
                                                        fontFamily: 'Segoe UI',
                                                        fontSize: '15px'
                                                    }
                                                }>Nhắc nợ đã tạo</b>
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink active={
                                                    this.state.activeTab === 1
                                                }
                                                onClick={
                                                    () => this.setActiveTab(1)
                                            }>
                                                <b style={
                                                    {
                                                        fontFamily: 'Segoe UI',
                                                        fontSize: '15px'
                                                    }
                                                }>Nhắc nợ đã nhận</b>
                                            </NavLink>
                                        </NavItem>
                                    </Nav>
                                </Col>
                                <Col>
                                    <button onClick={
                                            this.ActionAdd
                                        }
                                        style={
                                            {
                                                position: 'absolute',
                                                right: '20px',
                                                fontSize: '30px'
                                            }
                                    }><FcAddDatabase/></button>
                                </Col>
                            </FormGroup>
                            <TabContent activeTab={
                                this.state.activeTab
                            }>
                                <TabPane tabId={0}>
                                    <Row>
                                        <Col>
                                            <Table responsive bordered>
                                                <thead>
                                                    <tr>
                                                        <th>Mã giao dịch</th>
                                                        <th>Chủ khoản</th>
                                                        <th>Số tài khoản</th>
                                                        <th>Số tiền</th>
                                                        <th>Nội dung</th>
                                                        <th style={
                                                            {width: '12%'}
                                                        }></th>
                                                    </tr>
                                                </thead>
                                                <tbody> {
                                                    this.state.listDebts1.map((item, index) => {
                                                        return (
                                                            <tr>
                                                                <th scope="row">
                                                                    <a href={
                                                                            "/debt-detail?id=" + item.id
                                                                        }
                                                                        style={
                                                                            {
                                                                                fontSize: '15px',
                                                                                color: '#6c757d',
                                                                                textDecorationLine: 'underline'
                                                                            }
                                                                    }>
                                                                        {
                                                                        item.code
                                                                    }</a>
                                                                </th>
                                                                <td> {
                                                                    item.name
                                                                }</td>
                                                                <td> {
                                                                    item.number
                                                                }</td>
                                                                <td> {
                                                                    item.money
                                                                }</td>
                                                                <td> {
                                                                    item.content
                                                                }</td>
                                                                <td style={
                                                                    {textAlign: 'center'}
                                                                }>
                                                                    <button onClick={
                                                                            this.ActionPay
                                                                        }
                                                                        style={
                                                                            {
                                                                                fontSize: '24px',
                                                                                marginRight: '10px'
                                                                            }
                                                                    }><MdPayment/></button>
                                                                    <button onClick={
                                                                            () => {
                                                                                this.ActionCancel1(item.id)
                                                                            }
                                                                        }
                                                                        style={
                                                                            {
                                                                                fontSize: '24px',
                                                                                marginLeft: '10px'
                                                                            }
                                                                    }><AiOutlineDelete/></button>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                } </tbody>
                                            </Table>
                                        </Col>
                                    </Row>
                                </TabPane>
                                <TabPane tabId={1}>
                                    <Row>
                                        <Col>
                                            <Table responsive bordered>
                                                <thead>
                                                    <tr>
                                                        <th>Mã giao dịch</th>
                                                        <th>Chủ khoản</th>
                                                        <th>Số tài khoản</th>
                                                        <th>Số tiền</th>
                                                        <th>Nội dung</th>
                                                        <th style={
                                                            {width: '12%'}
                                                        }></th>
                                                    </tr>
                                                </thead>
                                                <tbody> {
                                                    this.state.listDebts2.map((item, index) => {
                                                        return (
                                                            <tr>
                                                                <th scope="row">
                                                                    <a href={
                                                                            "/debt-detail?id=" + item.id
                                                                        }
                                                                        style={
                                                                            {
                                                                                fontSize: '15px',
                                                                                color: '#6c757d',
                                                                                textDecorationLine: 'underline'
                                                                            }
                                                                    }>
                                                                        {
                                                                        item.code
                                                                    }</a>
                                                                </th>
                                                                <td> {
                                                                    item.name
                                                                }</td>
                                                                <td> {
                                                                    item.number
                                                                }</td>
                                                                <td> {
                                                                    item.money
                                                                }</td>
                                                                <td> {
                                                                    item.content
                                                                }</td>
                                                                <td style={
                                                                    {textAlign: 'center'}
                                                                }>
                                                                    <button onClick={
                                                                            this.ActionPay
                                                                        }
                                                                        style={
                                                                            {
                                                                                fontSize: '24px',
                                                                                marginRight: '10px'
                                                                            }
                                                                    }><MdPayment/></button>
                                                                    <button value={
                                                                            item.id
                                                                        }
                                                                        onClick={
                                                                            () => this.ActionCancel(item.id)
                                                                        }
                                                                        style={
                                                                            {
                                                                                fontSize: '24px',
                                                                                marginLeft: '10px'
                                                                            }
                                                                    }><AiOutlineDelete/></button>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                } </tbody>
                                            </Table>
                                        </Col>
                                    </Row>
                                </TabPane>
                            </TabContent>
                        </CardBody>
                    </Card>
                </div>
                <div id={'formAdd'}
                    style={
                        {
                            display: 'none',
                            border: '2px solid green',
                            borderRadius: '5px',
                            padding: '2em',
                            width: '80%',
                            textAlign: 'center',
                            backgroundColor: 'white',
                            position: 'absolute',
                            zIndex: '1',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%,-50%)'
                        }
                }>
                    <TabContent activeTab={
                        this.state.activeTab
                    }>
                        <TabPane tabId={0}>
                            <Card style={
                                {
                                    backgroundColor: 'green',
                                    textAlign: 'center',
                                    color: 'white',
                                    fontSize: '18px'
                                }
                            }>
                                <strong style={
                                    {fontSize: '22px'}
                                }>GỬI NHẮC NỢ</strong>
                            </Card>
                            <br/>
                            <Form id={'formID'}
                                onSubmit={
                                    this.submitForm
                            }>
                                <Card>
                                    <CardHeader>
                                        <strong>Thông tin người nhận</strong>
                                    </CardHeader>
                                    <CardBody>
                                        <FormGroup row>
                                            <Col md="3" className="d-flex p-3">
                                                <Label htmlFor="selectReceiver">Tài khoản gợi ý</Label>
                                            </Col>
                                            <Col xs="12" md="6">
                                                <Input type="select" name="selectReceiver" id="selectReceiver"
                                                    onChange={
                                                        this.selectReceiverChange
                                                }>
                                                    {
                                                    this.state.listReceivers.map((item, index) => {
                                                        if (item.bankCode == "GO") 
                                                            return <option value={
                                                                item.number
                                                            }>
                                                                {
                                                                item.remind_name
                                                            }</option>;
                                                        


                                                    })
                                                } </Input>
                                            </Col>
                                        </FormGroup>
                                        <FormGroup row>
                                            <Col md="3" className="d-flex p-3">
                                                <Label htmlFor="numberReceiver">Số tài khoản</Label>
                                            </Col>
                                            <Col xs="12" md="6">
                                                <Input type="text" name="numberReceiver"
                                                    onChange={
                                                        this.onChange
                                                    }
                                                    value={
                                                        this.state.numberReceiver
                                                }></Input>
                                            </Col>
                                        </FormGroup>
                                        <FormGroup row>
                                            <Col md="3" className="d-flex">
                                                <Label>Chủ tài khoản</Label>
                                            </Col>
                                            <Col xs="12" md="5">
                                                <Label> {
                                                    this.state.nameReceiver
                                                }</Label>
                                            </Col>
                                        </FormGroup>
                                    </CardBody>
                                    <CardHeader>
                                        <strong>THÔNG TIN NHẮC NỢ</strong>
                                    </CardHeader>
                                    <CardBody>
                                        <FormGroup row>
                                            <Col md="3" className="d-flex p-3">
                                                <Label htmlFor="money">Số tiền</Label>
                                            </Col>
                                            <Col xs="12" md="6">
                                                <Input type="number" name="money"
                                                    onChange={
                                                        this.onChange
                                                    }
                                                    value={
                                                        this.state.money
                                                }></Input>
                                            </Col>
                                        </FormGroup>
                                        <FormGroup row>
                                            <Col md="3" className="d-flex p-3">
                                                <Label htmlFor="message">Nội dung nhắc nợ</Label>
                                            </Col>
                                            <Col xs="12" md="6">
                                                <Input type="text" name="message"
                                                    onChange={
                                                        this.onChange
                                                    }
                                                    value={
                                                        this.state.message
                                                }></Input>
                                            </Col>
                                        </FormGroup>
                                    </CardBody>
                                </Card>
                                {/* {Gửi nhắc nợ}*/}
                                <br/>
                                <div style={
                                    {textAlign: 'center'}
                                }>
                                    <Button type={'submit'}
                                        disabled={
                                            this.state.nameReceiver == '' || this.state.money == null || this.state.money == ''
                                    }>GỬI NHẮC NỢ</Button>
                                    <Button onClick={
                                            this.ActionCancelForm
                                        }
                                        style={
                                            {marginLeft: '5px'}
                                    }>ĐÓNG</Button>
                                </div>
                            </Form>
                        </TabPane>
                        <TabPane tabId={1}>
                            <Card style={
                                {
                                    backgroundColor: 'green',
                                    textAlign: 'center',
                                    color: 'white',
                                    fontSize: '18px'
                                }
                            }>
                                <strong style={
                                    {fontSize: '22px'}
                                }>Chi tiết giao dịch</strong>
                            </Card>
                            <br/>
                            <Form onSubmit={
                                    this.submitForm
                                }
                                style={
                                    {textAlign: 'left'}
                            }>
                                <FormGroup>
                                    <Card>
                                        <CardBody>
                                            <Label>
                                                <b style={
                                                    {color: 'green'}
                                                }>Tình trạng</b>
                                            </Label>
                                            <br/>
                                            <Label>• Gửi nhắc nợ thành công</Label>
                                        </CardBody>
                                    </Card>
                                </FormGroup>
                                <FormGroup>
                                    <Card>
                                        <CardBody>
                                            <Label>
                                                <b style={
                                                    {color: 'green'}
                                                }>Thông tin giao dịch</b>
                                            </Label>
                                            <br/>
                                            <Label>• Mã giao dịch:
                                                <a href= {'/transaction/detail?id=' + this.state.code}>
                                                    <b style={
                                                        {fontSize: '13px'}
                                                    }>
                                                        {
                                                        ` ${
                                                            this.state.code
                                                        }`
                                                    }</b>
                                                </a>
                                            </Label>
                                            <br/>
                                            <Label>• {
                                                this.state.time
                                            }</Label>
                                        </CardBody>
                                    </Card>
                                </FormGroup>
                                <FormGroup>
                                    <Card>
                                        <CardBody>
                                            <Label>
                                                <b style={
                                                    {color: 'green'}
                                                }>Thông tin người nhận</b>
                                            </Label>
                                            <br/>
                                            <Label>• Số tài khoản: {
                                                this.state.numberReceiver
                                            }</Label>
                                            <br/>
                                            <Label>• Chủ tài khoản: {
                                                this.state.nameReceiver
                                            }</Label>
                                        </CardBody>
                                    </Card>
                                </FormGroup>
                                <FormGroup>
                                    <Card>
                                        <CardBody>
                                            <Label>
                                                <b style={
                                                    {color: 'green'}
                                                }>Thông tin nhắc nợ</b>
                                            </Label>
                                            <br/>
                                            <Label>• Số tiền: {
                                                `${
                                                    this.state.money
                                                } `
                                            }
                                                VNĐ</Label>
                                            <br/>
                                            <Label>• Nội dung nhắc nợ: {
                                                this.state.message
                                            }</Label>
                                        </CardBody>
                                    </Card>
                                </FormGroup>
                                {/* {Chuyển tiền}*/}
                                <br/>
                                <div style={
                                    {textAlign: 'center'}
                                }>
                                    <Button onClick={
                                            this.ActionCancelForm
                                        }
                                        style={
                                            {marginLeft: '5px'}
                                    }>ĐÓNG</Button>
                                </div>
                            </Form>
                        </TabPane>
                    </TabContent>
                </div>
            </div>
        );
    }
}
