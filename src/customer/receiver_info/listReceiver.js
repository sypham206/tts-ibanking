import React from "react";
import DB from './../database/index';
import {connector} from "./../../callAxios";
import {AiOutlineDelete} from "react-icons/ai";
import {FaRegEdit} from "react-icons/fa";
import {FcAddDatabase} from "react-icons/fc";
import {
    Card,
    Col,
    Row,
    Table,
    CardBody,
    CardHeader,
    FormGroup,
    TabContent,
    TabPane,
    Form,
    Label,
    Input,
    Button


} from "reactstrap";

export default class receiversComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            listReceivers: null,
            nameReceiver2: '',
            numberReceiver: '1345',
            remindReceiver: '',
            bank_code: ''
        }
        this.onChange = this.onChange.bind(this);
        this.getDatabase = this.getDatabase.bind(this);
        this.actionEdit = this.actionEdit.bind(this);
        this.actionDelete = this.actionDelete.bind(this);
        this.ActionAdd = this.ActionAdd.bind(this);
        this.selectBankChange = this.selectBankChange.bind(this);

    }

    onChange(e) {
        this.setState({[e.target.name]: e.target.value})
        // Nếu sự kiện ở thẻ Input Account Receiver thì thay đổi giá trị Name Receiver và làm rỗng thẻ gợi ý
        if (e.target.name == "numberReceiver5") {
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

    selectBankChange(e) {
        const bankSelected = e.target.value;
        let res = '';
        DB.listBanks().forEach(element => {
            if (element.bankCode == bankSelected) {
                res = {
                    name: element.name,
                    type: element.type,
                    secretKey: element.secretKey,
                    bankCode: element.bankCode
                }
            }
        });
        this.setState({bank_code: res.bankCode})
    }

    // actionEdit = async (data) => { // alert('Chỉnh sửa thông tin');
    //     alert(data);
    //     // e.preventDefault();
    //     // const {formID} = document.forms;
    //     // formID.reset();
    //     // document.getElementById('formEdit').style.display = "block";
    //     // document.getElementById('formEdit').focus();

    // }

    actionEdit = async (number) => { // Open form
        const {formID} = document.forms;
        formID.reset();
        document.getElementById('formEdit').style.display = "block";

        // Lấy giá trị STK
        this.setState({numberReceiver: number});
        document.getElementById('formEdit').focus();

    }

    actionDelete = async (number) => { // Lấy giá trị STK
        this.setState({numberReceiver: number});

        // Xóa
        const reqBody = {
            receiver_account_number: this.state.numberReceiver
        }

        const response = await connector.post(`list-receiver1/delete`, reqBody).then((response) => {
            console.log("response", response);
            if (response.data.message == 'ok') {
                alert('Xóa thành công thành công!');
            }
        }, (error) => {
            console.log("Error! Xóa người nhận: ", error.response);
            alert('Lỗi xóa người nhận!');
        });

        this.setState({numberReceiver: number});
    }

    ActionAdd(e) {
        e.preventDefault();
        const {formID} = document.forms;
        formID.reset();
        document.getElementById('formAdd').style.display = "block";
        document.getElementById('formAdd').focus();

    }

    ActionCancelForm(e) {
        e.preventDefault();
        document.getElementById('formAdd').style.display = "none";
        // document.getElementById('main').style.display = "block";
    }

    ActionCancelEditForm(e) {
        e.preventDefault();
        document.getElementById('formEdit').style.display = "none";
        // document.getElementById('main').style.display = "block";
    }


    submitForm = async (e) => {
        e.preventDefault()
        // Thực hiện tạo người nhận
        alert(this.state.bank_code);
        const type = this.state.remindReceiver == '' ? 1 : 2;
        const reqBody = {
            bank_code: this.state.bank_code,
            receiver_account_number: this.state.numberReceiver,
            remind_name: this.state.remindReceiver,
            type: type
        }

        const response = await connector.post(`list-receiver1`, reqBody).then((response) => {
            console.log("response", response);
            if (response.data.message == 'thêm thành công') {
                alert('Thêm thành công!');
            }
        }, (error) => {
            console.log("Error! Gửi thêm người nhận: ", error.response);
            alert('Lỗi gửi thêm người nhận!');
        });

        // Đóng form
        document.getElementById('formAdd').style.display = "none";

        // Chuyển qua màn hình thông báo
        // this.setState({activeTab: 1});
    }

    submitEditForm = async (e) => {
        e.preventDefault()
        // Thực hiện sửa tên gợi nhớ
        // alert(this.state.numberReceiver);
        const reqBody = {
            receiver_account_number: this.state.numberReceiver,
            remind_name: this.state.remindReceiver
        }


        const response = await connector.post(`list-receiver1/edit`, reqBody).then((response) => {
            console.log("response", response);
            if (response.data.message == 'ok') {
                alert('Chỉnh sửa thành công!');
            }
        }, (error) => {
            console.log("Error! Chỉnh sửa người nhận: ", error.response);
            alert('Lỗi chỉnh sửa người nhận!');
        });

        // Đóng form
        document.getElementById('formEdit').style.display = "none";

        // Chuyển qua màn hình thông báo
        // this.setState({activeTab: 1});
    }

    getDatabase = async (e) => { // Refresh token để gọi backend trước
        DB.refreshToken();
        // Call axios
        const response = await connector.get("/list-receiver1", {}).then((response) => {
            console.log("response", response);
            let listReceivers = [];
            response.data.forEach(element => {
                listReceivers = listReceivers.concat([{
                        remind_name: element.remind_name,
                        number: element.receiver_account_number,
                        bankCode: element.bank_code
                    }]);
            });

            // Dữ liệu dạng thẻ html
            const html = listReceivers.map((item, index) => {
                return (
                    <tr>
                        <th scope="row">
                            {
                            index + 1
                        }</th>
                        <td> {
                            item.number
                        }</td>
                        <td> {
                            item.remind_name
                        }</td>
                        <td> {
                            item.bankCode
                        }</td>
                        <td style={
                            {textAlign: 'center'}
                        }>
                            <button onClick={
                                    () => {
                                        this.actionEdit(item.number)
                                    }
                                }
                                style={
                                    {
                                        fontSize: '24px',
                                        marginRight: '10px'
                                    }
                            }><FaRegEdit/></button>
                            <button onClick={
                                    () => {
                                        this.actionDelete(item.number)
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
            // Lưu vào state
            this.setState({listReceivers: html})
        }, (error) => {
            console.log("Error! Infor: ", error.response);
            alert('Lỗi xảy ra!');
        });
    }
    render = () => { // Lấy dữ liệu từ backend đưa vào trong state
        this.getDatabase();
        const listBanks = DB.listBanks().map((item, index) => {
            return (
                <option value={
                    item.bankCode
                }>
                    {
                    item.name
                }</option>
            );
        });

        // Tải lên giao diện
        return (
            <div>
                <div className="animated fadeIn">
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
                            <strong>Danh sách tài khoản người nhận</strong>
                        </CardHeader>
                        <CardBody style={
                            {
                                borderStyle: 'ridge',
                                borderColor: '#435d7d'
                            }
                        }>
                            <FormGroup>
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
                            <FormGroup>
                                <Row>
                                    <Col>
                                        <Table responsive bordered>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Số tài khoản</th>
                                                    <th>Tên gợi nhớ</th>
                                                    <th>Ngân hàng</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody> {
                                                this.state.listReceivers
                                            } </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                            </FormGroup>
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
                                        <Label htmlFor="bankName">Ngân hàng</Label>
                                    </Col>
                                    <Col xs="12" md="6">
                                        <Input type="select" name="bankName" id="bankName"
                                            onChange={
                                                this.selectBankChange
                                        }>
                                            {listBanks} </Input>
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
                                <FormGroup row>
                                    <Col md="3" className="d-flex">
                                        <Label>Tên gợi nhớ khoản</Label>
                                    </Col>
                                    <Col xs="12" md="6">
                                        <Input type="text" name="remindReceiver"
                                            onChange={
                                                this.onChange
                                            }
                                            value={
                                                this.state.remindReceiver
                                        }></Input>
                                    </Col>
                                </FormGroup>
                            </CardBody>
                        </Card>
                        {/* {Thêm người nhận}*/}
                        <br/>
                        <div style={
                            {textAlign: 'center'}
                        }>
                            <Button type={'submit'}
                                disabled={false}>TẠO NGƯỜI NHẬN MỚI</Button>
                            <Button onClick={
                                    this.ActionCancelForm
                                }
                                style={
                                    {marginLeft: '5px'}
                            }>ĐÓNG</Button>
                        </div>
                    </Form>
                </div>
                <div id={'formEdit'}
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
                    <Form id={'formID'}
                        onSubmit={
                            this.submitEditForm
                    }>
                        <Card>
                            <CardHeader>
                                <strong>Thông tin người nhận</strong>
                            </CardHeader>
                            <CardBody>
                                <FormGroup row>
                                    <Col>
                                        <Label>• Số tài khoản: {
                                            this.state.numberReceiver
                                        }</Label>
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Col md="3" className="d-flex">
                                        <Label>Tên gợi nhớ khoản</Label>
                                    </Col>
                                    <Col xs="12" md="6">
                                        <Input type="text" name="remindReceiver"
                                            onChange={
                                                this.onChange
                                            }
                                            value={
                                                this.state.remindReceiver
                                        }></Input>
                                    </Col>
                                </FormGroup>
                            </CardBody>
                        </Card>
                        {/* {Thêm người nhận}*/}
                        <br/>
                        <div style={
                            {textAlign: 'center'}
                        }>
                            <Button type={'submit'}
                                disabled={false}>TẠO NGƯỜI NHẬN MỚI</Button>
                            <Button onClick={
                                    this.ActionCancelEditForm
                                }
                                style={
                                    {marginLeft: '5px'}
                            }>ĐÓNG</Button>
                        </div>
                    </Form>
                </div>

            </div>
        );
    }
}
