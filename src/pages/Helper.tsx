import React, { useState, useRef, useEffect } from 'react'
import Grid from "../components/widgets/Grid";
import { Select } from "../components/ui/fields/Select";
import { Wrapper, Container, Row, Col } from "../components/ui/GridSystem";
import Card from "../components/ui/Card";
import { String, Number, Email, Password, Color, Date, Time, DateTime, Week, Month, TextArea, Checkbox, ListGroup, Switch, Label } from "../components/ui/fields/Input";
import { Autocomplete, Checklist } from "../components/ui/fields/Select";
import { UploadDocument, UploadImage } from "../components/ui/fields/Upload";
import { ActionButton, LoadingButton, GoSite, ReferSite } from "../components/ui/Buttons";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import Notifications from "../components/blocks/Notifications";
import Search from "../components/blocks/Search";
import Form from "../components/widgets/Form";
import TabDynamic from "../components/ui/TabDynamic";
import Tab, { TabItem } from "../components/ui/Tab";
import Table from "../components/ui/Table";
import Brand from "../components/blocks/Brand";
import { Breadcrumbs } from "../components/blocks/Breadcrumbs";
import Carousel from "../components/blocks/Carousel";
import { Dropdown, DropdownItem } from "../components/blocks/Dropdown";
import Image from "../components/ui/Image";
import Gallery from "../components/ui/Gallery";
import Loader from "../components/ui/Loader";
import Percentage from "../components/ui/Percentage";
import Repeat from "../components/ui/Repeat";
import Component from "../components/Component";
import Modal from "../components/ui/Modal";
import ImageEditor from "../components/widgets/ImageEditor";
import { PLACEHOLDER_BRAND, PLACEHOLDER_IMAGE } from '../Theme';
import Menu from '../components/blocks/Menu';
import Code from '../components/ui/Code';
import Pagination from '../components/ui/Pagination';
import { useLocation } from 'react-router-dom';


declare global {
  interface Window {
    bootstrap: any;
  }
}

function Helper() {

  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false)
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (window.bootstrap && scrollRef.current) {
      window.bootstrap.ScrollSpy.getOrCreateInstance(scrollRef.current, {
        target: '#sidebar-bootstrap',
        smoothScroll: true
      });
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const recordSet = []
  for (let i = 1; i <= 30; i++) {
    recordSet.push('Valore ' + i)
  }

  return (
    <Container className='mb-5'>
      <Row className='justify-content-center'>
        <Col xl={10}>
          <Row>
            <Col xl={9}>
              {/* ScrollSpy container: native div for correct Bootstrap behavior */}
              <div
                ref={scrollRef}
                data-bs-spy="scroll"
                data-bs-target="#sidebar-bootstrap"
                data-bs-smooth-scroll="true"
                className="p-2"
                tabIndex={0}
                style={{ height: "80vh", overflowY: "auto" }}
              >
                <h1>Helper</h1>
                <p>Helper is a component that helps you to create a form.</p>

                {/* Input */}
                <Row className='pb-3'>
                  <Col lg={5}>
                    <h2 id='input'>Input</h2>
                    <Form dataStoragePath='' header="Input">
                      {/* String */}
                      <String name='text' label='String' placeholder='Lorem ipsum.' />
                      {/* Number */}
                      <Number name='number' label='Number' value={10} />
                      {/* Email */}
                      <Email name='email' label='Email' placeholder='test@example.com' />
                      {/* Password */}
                      <Password name='password' label='Password' placeholder='my passowrd' />
                      {/* Color */}
                      <Color name='color' label='Color' placeholder='Pick a Color' />
                      {/* TextArea */}
                      <TextArea name='textarea' label='Text Area' placeholder='Lorem ipsum.' />
                    </Form>
                  </Col>
                  <Col lg={7}>
                    <Code language='jsx' className='h-100 d-flex flex-grow-1 m-0'>
                      {`<Form dataStoragePath='' header="Input">

                        {/* String */}
                        <String name='text' label='String' placeholder='Lorem ipsum.' />

                        {/* Number */}
                        <Number name='number' label='Number' value={10} />

                        {/* Email */}
                        <Email name='email' label='Email' placeholder='test@example.com' />

                        {/* Password */}
                        <Password name='password' label='Password' placeholder='my passowrd' />

                        {/* Color */}
                        <Color name='color' label='Color' placeholder='Pick a Color' />

                        {/* TextArea */}
                        <TextArea name='textarea' label='Text Area' placeholder='Lorem ipsum.' />

                      </Form>`}
                    </Code>
                  </Col>
                </Row>
                <Row className='pb-3'>
                  <Col lg={5}>
                    {/* Date */}
                    <Form dataStoragePath='' header="Date Input">
                      {/* Date */}
                      <Date name='date' label='Date' />
                      {/* Time */}
                      <Time name='time' label='Time' />
                      {/* DateTime */}
                      <DateTime name='datetime' label='DateTime' />
                      {/* Week */}
                      <Week name='week' label='Week' />
                      {/* Month */}
                      <Month name='month' label='Month' />
                    </Form>
                  </Col>
                  <Col lg={7}>
                    <Code language='jsx' className='h-100 d-flex flex-grow-1 m-0'>
                      {`<Form dataStoragePath='' header="Date Input">

                        {/* Date */}
                        <Date name='date' label='Date'/>

                        {/* Time */}
                        <Time name='time' label='Time' />

                        {/* DateTime */}
                        <DateTime name='datetime' label='DateTime' />

                        {/* Week */}
                        <Week name='week' label='Week'/>
                        
                        {/* Month */}
                        <Month name='month' label='Month'  />

                      </Form>`}
                    </Code>
                  </Col>
                </Row>

                <Row>
                  <Col xs={12} lg={5}>
                    {/* Boolean */}
                    <Form dataStoragePath='' header="Boolean Input">
                      {/* Checkbox */}
                      <Label label='Checkboxes' />
                      <Checkbox name='checkbox1' label='Checkbox1' />
                      <Checkbox name='checkbox2' label='Checkbox2' className='mb-3' value={true} />
                      {/* Switch */}
                      <Label label='Switches' />
                      <Switch name='switch1' label='Switch input' onChange={() => { }} value={false} />
                      <Switch name='switch2' onChange={() => { }} label='Switch input' className='mb-3' value={true} />
                    </Form>

                    {/* List -> Select? */}
                    <Form dataStoragePath='' header="List Group">
                      <ListGroup actives={[0]} disables={[1]} className='mb-3' itemClass='p-1'>
                        <span className='text-danger'>Element1</span>
                        <span className='text-success'>Element2</span>
                        <span className='text-warning'>Element3</span>
                      </ListGroup>
                      <ListGroup label='List Group with onClick' onClick={(e, index) => { console.log("List Group click", index, e.currentTarget.innerHTML) }} actives={[0]} disables={[1]}>
                        <span className='text-danger'>Element1</span>
                        <span className='text-success'>Element2</span>
                        <span className='text-warning'>Element3</span>
                      </ListGroup>
                    </Form>
                  </Col>

                  {/* Selectors */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='selectors'>Selectors</h2>
                    <Card className='mb-3'>
                      <form className='form-group'>
                        {/* Select  */}
                        <Select name='select' label='Select' className='mb-3' value={'Option1'} options={['Option1', 'Option2', 'Option3']} />
                        {/* Autocomplete */}
                        <Autocomplete name='autocomplete' label='Autocomplete' options={['Option1', 'Option2', 'Option3']} />
                        {/* Checklist */}
                        <Checklist name='checklist' label='Checklist' checkClass='mb-3' options={['Option1', 'Option2', 'Option3']} />

                      </form>
                    </Card>
                  </Col>

                  {/* Upload */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='upload'>Upload</h2>
                    {/* Documenti */}
                    <Form dataStoragePath='' header="Documents Upload">
                      <UploadDocument name='uploadDocument' label="Upload Multiple Documents" editable multiple />

                      <UploadDocument name='uploadDocument' label="Upload Document not Editable" />
                    </Form>

                    {/* Immagini */}
                    <Form dataStoragePath='' header="Images Upload">
                      <UploadImage name='uploadImage' label='Upload Multiple Images' previewWidth={150} previewHeight={150} multiple editable />

                      <UploadImage name='uploadImage' label='Upload Single Image' editable />

                      <UploadImage name='uploadImage' label='Upload Single Image not Editable Images' />
                    </Form>
                  </Col>

                  {/* Alert */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='alert'>Alert</h2>
                    <Card className='mb-3'>
                      <Alert type="info" children="Info" />
                      <Alert type="success" children="Success" />
                      <Alert type="warning" children="Warning" />
                      <Alert type="danger" children="Danger" />
                      <Alert type="primary" children="Primary" />
                      <Alert type="secondary" children="Secondary" />
                      <Alert type="light" children="Light" />
                      <Alert type="dark" children="Dark" />

                      <ActionButton onClick={()=>setShowAlert(true)} label='click alert fixed'/>
                      {showAlert && <Alert isFixed='top' onClose={()=>setShowAlert(false)}>Prova Alert fixedTop con timeout 5s</Alert>}
                    </Card>
                  </Col>

                  {/* Badge */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='badge'>Badge</h2>
                    <Card className='mb-3'>
                      <Row className='gap-2 d-flex justify-content-center'>
                        <Col sm={5}>
                          <Badge type="info" children="Info" className='mb-3 w-100' />
                        </Col>
                        <Col sm={5}>
                          <Badge type="success" children="Success" className='mb-3 w-100' />
                        </Col>
                        <Col sm={5}>
                          <Badge type="warning" children="Warning" className='mb-3 w-100' />
                        </Col>
                        <Col sm={5}>
                          <Badge type="danger" children="Danger" className='mb-3 w-100' />
                        </Col>
                        <Col sm={5}>
                          <Badge type="primary" children="Primary" className='mb-3 w-100' />
                        </Col>
                        <Col sm={5}>
                          <Badge type="secondary" children="Secondary" className='mb-3 w-100' />
                        </Col>
                        <Col sm={5}>
                          <Badge type="light" children="Light" className='mb-3 w-100' />
                        </Col>
                        <Col sm={5}>
                          <Badge type="dark" children="Dark" className='mb-3 w-100' />
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                  {/* Buttons */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='buttons'>Buttons</h2>
                    <Card className='mb-3'>
                      <Row>
                        <Col className='d-flex gap-3 mb-3'>
                          {/* Loading Button */}
                          <Label label='Loading Button' />
                          <LoadingButton
                            label="Loading Button"
                            icon="save"
                            showLoader={false}
                            onClick={async () => {
                              // Simula una chiamata async
                              await new Promise((res) => setTimeout(res, 1000));
                              alert("Dati salvati!");
                            }}
                          />

                        </Col>
                        <Col className='d-flex gap-3 mb-3'>
                          {/* Action Button */}
                          <Label label='Action Button' />
                          <ActionButton
                            label="Action Button"
                            icon="box-arrow-up-right"
                            title="Apri finestra"
                            toggle="modal"
                            target="#myModal"
                            onClick={() => console.log("Azione eseguita!")}
                          />
                        </Col>
                        <Col className='d-flex gap-3 mb-3'>
                          {/* Go Site */}
                          <Label label='Go Site' />
                          <GoSite
                            label="Go site Button"
                            url="https://www.example.com"
                          />
                        </Col>
                        <Col className='d-flex gap-3 mb-3'>
                          {/* Refer Site */}
                          <Label label='Refer Site' />
                          <ReferSite
                            title="OpenAI"
                            url="https://www.openai.com"
                            imageUrl={PLACEHOLDER_BRAND}
                            width={120}
                          />
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                  {/* Card */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='card'>Card</h2>
                    <Card className='mb-3'>
                      <Card
                        className="shadow-sm"
                        wrapClass="my-3"
                        title="Card Title"
                        header={<span className="text-muted">Header</span>}
                        footer={<div>Footer with actions.</div>}
                        showLoader={false}
                        showArrow={true}

                      >
                        <p>Main content.</p>
                      </Card>
                      <Card
                        title="Data loading"
                        showLoader={true}
                      >
                        <p>Data will be show when loaded.</p>
                      </Card>
                    </Card>
                  </Col>

                  {/* Gallery */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='gallery'>Gallery</h2>
                    <Card className='mb-3'>
                      <Gallery
                        body={
                          [
                            {
                              thumbnail: PLACEHOLDER_IMAGE,
                              name: 'Foto 1',
                              mimetype: '',
                              width: 100,
                              height: 100,
                            },
                            {
                              thumbnail: PLACEHOLDER_IMAGE,
                              name: 'Foto 2',
                              mimetype: '',
                              width: 100,
                              height: 100,
                            },
                            {
                              thumbnail: PLACEHOLDER_IMAGE,
                              name: 'Foto 3',
                              mimetype: '',
                              width: 100,
                              height: 100,
                            },
                            {
                              thumbnail: PLACEHOLDER_IMAGE,
                              name: 'Foto 4',
                              mimetype: '',
                              width: 100,
                              height: 100,
                            },
                            {
                              thumbnail: PLACEHOLDER_IMAGE,
                              name: 'Foto 5',
                              mimetype: '',
                              width: 100,
                              height: 100,
                            },
                            {
                              thumbnail: PLACEHOLDER_IMAGE,
                              name: 'Foto 6',
                              mimetype: '',
                              width: 100,
                              height: 100,
                            },
                            {
                              thumbnail: PLACEHOLDER_IMAGE,
                              name: 'Foto 7',
                              mimetype: '',
                              width: 100,
                              height: 100,
                            },
                            {
                              thumbnail: PLACEHOLDER_IMAGE,
                              name: 'Foto 8',
                              mimetype: '',
                              width: 100,
                              height: 100,
                            },
                            {
                              thumbnail: PLACEHOLDER_IMAGE,
                              name: 'Foto 9',
                              mimetype: '',
                              width: 100,
                              height: 100,
                            },
                            {
                              thumbnail: PLACEHOLDER_IMAGE,
                              name: 'Foto 10',
                              mimetype: '',
                              width: 100,
                              height: 100,
                            }
                          ]
                        }
                        Header={<h5>Galleria immagini</h5>}
                      />
                    </Card>
                  </Col>

                  {/* GridSystem */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='gridSystem'>GridSystem</h2>
                    <Card className='mb-3'>
                      <Wrapper>
                        <Container>
                          <Row>
                            <Col xs={12} sm={6} md={4} className='bg-primary py-3'>
                              Colonna 1
                            </Col>
                            <Col xs={12} sm={6} md={4} className='bg-secondary py-3'>
                              Colonna 2
                            </Col>
                            <Col xs={12} sm={12} md={4} className='bg-dark py-3'>
                              Colonna 3
                            </Col>
                          </Row>
                        </Container>
                      </Wrapper>
                    </Card>
                  </Col>

                  {/* Images */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='images'>Images</h2>
                    <Card className='mb-3' title='Image'>
                      <p>This is the standard HTML tag for displaying an image. It is simple and easy to use, but it doesn't handle errors, fallbacks, or custom caching. If the image fails to load, the user will see a broken image icon.

                      </p>
                      <Image
                        src={PLACEHOLDER_IMAGE}
                        className="img-fluid"
                        width={150}
                        height={150}
                      />
                    </Card>
                    {/* ImageAvatar */}
                    <Card className='mb-3' title='Image Avatar'>
                      <p>ImageAvatar is a React component that:
                        <ul>
                          <li>Displays a default placeholder if the image fails to load</li>
                          <li>Converts the image to base64 and stores it in localStorage for local caching</li>
                          <li>Reuses cached images to improve performance</li>
                          <li>Handles alternate text smartly using alt, title, or the filename</li>
                          <li>Provides robust error handling and a better user experience</li>
                        </ul>
                      </p>
                      <Image
                        src={PLACEHOLDER_IMAGE}
                        className="img-fluid"
                        width={150}
                        height={150}
                      />
                    </Card>
                  </Col>

                  {/* Loader */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='loader'>Loader</h2>
                    <Card className='mb-3'>
                      <Loader
                        children="Loading..."
                        show={true}
                      />
                    </Card>
                  </Col>

                  {/* Modal */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='modal'>Modal</h2>
                    <Card className='mb-3' title=''>
                      <ActionButton label='Open modal' onClick={async () => { setShowModal(true) }} />
                      {showModal &&
                        <Modal
                          title="Modal Title"
                          header={"Header Subtitle"}
                          footer={<div>Footer with actions.</div>}
                          size="lg"
                          onClose={() => { setShowModal(false) }}
                        >
                          <p>Main content.</p>
                        </Modal>
                      }
                    </Card>
                  </Col>

                  {/* Percentage */}
                  <Col xs={12} className='mb-5'>
                    <h2 id="percentage">Percentage</h2>
                    <Card className='mb-3' header='Percentage'>
                      <div className='mb-2'>
                        <Percentage className='me-2' min={0} max={100} val={30} shape='circle' label='Circle' fontSize={30} />
                        <Percentage className='me-2' min={0} max={100} val={40} shape='circle' size={100} thickness={15} type='success' />
                        <Percentage className='me-2' min={0} max={100} val={50} shape='circle' size={80} thickness={20} type='danger' />
                        <Percentage className='me-2' min={0} max={100} val={60} shape='circle' size={60} thickness={25} type='warning' showText={false} />
                        <Percentage className='me-2' min={0} max={100} val={70} shape='circle' size={40} thickness={30} type='info' showText={false} />
                      </div>

                      <Percentage label='Bar' className='mb-2' min={0} max={10} val={3} shape='bar' size={40} thickness={30} type='info' />
                      <Percentage className='mb-2' min={0} max={10} val={4} shape='bar' size={60} thickness={25} type='warning' />
                      <Percentage className='mb-2' min={0} max={10} val={5} shape='bar' size={80} thickness={20} type='danger' />
                      <Percentage className='mb-2' min={0} max={10} val={6} shape='bar' size={100} thickness={15} type='success' showText={false} />
                      <Percentage className='mb-2' min={0} max={10} val={7} shape='bar' thickness={2} showText={false} />
                    </Card>
                  </Col>

                  {/* Repeat */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='repeat'>Repeat</h2>
                    <Card className='mb-3' title=''>
                      <Repeat name=''>
                        <String name='repeat' label='Repeat 1' className='mb-3' placeholder='Lorem ipsum.' />
                        <String name='repeat' label='Repeat 2' className='mb-3' placeholder='Lorem ipsum.' />
                        <String name='repeat' label='Repeat 3' className='mb-3' placeholder='Lorem ipsum.' />
                      </Repeat>
                    </Card>
                  </Col>

                  {/* Tab */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='tab'>Tab</h2>
                    <Card className='mb-3' title='Tabs'>
                      <h3>Default</h3>
                      <Tab tabPosition='default'>
                        <TabItem label='Intro'>
                          <p>Lorem ipsum. Content 1 or Component Nested 1</p>
                          <p>Lorem ipsum. Content 2 or Component Nested 2</p>
                          <p>Lorem ipsum. Content 3 or Component Nested 3</p>
                        </TabItem>
                        <TabItem label='Tab 2'>
                          <String name='example' label='Example Tab 2' />
                          <TextArea name='example' label='Example Tab 2' />
                        </TabItem>
                        <TabItem label='End'>
                          <Card
                            title='Card Example Tab 3'
                            header={"Lorem ipsum. Content 1 or Component Nested 1"}
                            footer={"Lorem ipsum. Content 2 or Component Nested 2"}
                            showLoader={false}
                            showArrow={true}
                          >
                            <p>Main content.</p>
                            <hr />
                            <TextArea name='example' label='Example Tab 3' />
                          </Card>
                        </TabItem>
                      </Tab>
                      <br /><hr /><br />
                      <h3>Top</h3>
                      <Tab tabPosition='top'>
                        <TabItem label='Tab1'>
                          <p>Lorem ipsum. Content 1 or Component Nested 1</p>
                        </TabItem>
                        <TabItem label='Tab2'>
                          <p>Lorem ipsum. Content 2 or Component Nested 2</p>
                        </TabItem>
                        <TabItem label='Tab3'>
                          <p>Lorem ipsum. Content 3 or Component Nested 3</p>
                        </TabItem>
                      </Tab>
                      <br /><hr /><br />
                      <h3>Left</h3>
                      <Tab tabPosition='left'>
                        <TabItem label='Tab1'>
                          <p>Lorem ipsum. Content 1 or Component Nested 1</p>
                        </TabItem>
                        <TabItem label='Tab2'>
                          <p>Lorem ipsum. Content 2 or Component Nested 2</p>
                        </TabItem>
                        <TabItem label='Tab3'>
                          <p>Lorem ipsum. Content 3 or Component Nested 3</p>
                        </TabItem>
                      </Tab>
                      <br /><hr /><br />
                      <h3>Right</h3>
                      <Tab tabPosition='right'>
                        <TabItem label='Tab1'>
                          <p>Lorem ipsum. Content 1 or Component Nested 1</p>
                        </TabItem>
                        <TabItem label='Tab2'>
                          <p>Lorem ipsum. Content 2 or Component Nested 2</p>
                        </TabItem>
                        <TabItem label='Tab3'>
                          <p>Lorem ipsum. Content 3 or Component Nested 3</p>
                        </TabItem>
                      </Tab>
                      <br /><hr /><br />
                      <h3>Bottom</h3>
                      <Tab tabPosition='bottom'>
                        <TabItem label='Tab1'>
                          <p>Lorem ipsum. Content 1 or Component Nested 1</p>
                        </TabItem>
                        <TabItem label='Tab2'>
                          <p>Lorem ipsum. Content 2 or Component Nested 2</p>
                        </TabItem>
                        <TabItem label='Tab3'>
                          <p>Lorem ipsum. Content 3 or Component Nested 3</p>
                        </TabItem>
                      </Tab>
                    </Card>
                    <Card className='mb-3' title='Dynamic Tabs (TabDynamic)'>
                      <h3>Default</h3>
                      <TabDynamic name='tabDynamic' min={1} label='Tab'>
                        <String name='example' label='Example Tab 1' />
                      </TabDynamic>
                      <br /><hr /><br />
                      <h3>Top</h3>
                      <TabDynamic name='tabDynamic2' min={2} label='Tab' tabPosition='top'>
                        <String name='example' label='Example Tab 2' />
                      </TabDynamic>
                      <br /><hr /><br />
                      <h3>Left</h3>
                      <TabDynamic name='tabDynamic3' min={3} label='Tab' tabPosition='left'>
                        <String name='example' label='Example Tab 3' />
                      </TabDynamic>
                      <br /><hr /><br />
                      <h3>Right</h3>
                      <TabDynamic name='tabDynamic4' min={4} max={4} label='Tab' tabPosition='right'>
                        <String name='example' label='Example Tab 4' />
                      </TabDynamic>
                      <br /><hr /><br />
                      <h3>Bottom</h3>
                      <TabDynamic name='tabDynamic5' min={0} readOnly={true} value={[{ example: 'first Tab' }, { example: 'second Tab' }, { example: 'third Tab' }]} label='Tab' tabPosition='bottom'>
                        <String name='example' label='Example Tab 5' />
                      </TabDynamic>
                    </Card>
                  </Col>

                  {/* Table */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='table'>Table</h2>
                    <Card className='mb-3' title=''>
                      <Table
                        header={[
                          { label: 'ID', key: 'id' },
                          { label: 'Name', key: 'name' },
                          { label: 'Email', key: 'email' },
                        ]}
                        body={[
                          { id: 1, name: 'John Doe', email: 'john@doe.com' },
                          { id: 2, name: 'Jane Doe', email: 'jane@doe.com' },
                          { id: 3, name: 'Alice Smith', email: 'alice@smith.com' },
                          { id: 4, name: 'Bob Johnson', email: 'bob@johnson.com' },
                          { id: 5, name: 'Charlie Brown', email: 'charlie@brown.com' }
                        ]}
                        onClick={(index) => {
                          console.log(index);
                        }}
                      />
                    </Card>
                  </Col>

                  {/* Brand */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='brand'>Brand</h2>
                    <Card className='mb-3' title=''>
                      <Brand url='https://it.wikipedia.org/wiki/Sicurezza_informatica' logo={PLACEHOLDER_BRAND} label='Cyber' />
                    </Card>
                  </Col>

                  {/* Breadcrumbs */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='breadcrumb'>Breadcrumbs</h2>
                    <Card className='mb-3' title=''>
                      <Breadcrumbs className="mb-3" pre={<i className="bi bi-house-door-fill" />} />
                    </Card>
                  </Col>

                  {/* Carousel */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='carousel'>Carousel</h2>
                    <Card className='mb-3' title=''>
                      <Carousel
                        showIndicators={true}
                        showControls={true}
                        showCaption={true}
                        layoutDark={true}
                        autoPlay={{ interval: 3000, pause: "hover", wrap: true }}
                        startSlide={0}
                      >
                        {[
                          <img key="1" src={PLACEHOLDER_IMAGE} alt="First slide" className="d-block w-50 m-auto" />,
                          <img key="2" src={PLACEHOLDER_IMAGE} alt="Second slide" className="d-block w-50 m-auto" />,
                          <img key="3" src={PLACEHOLDER_IMAGE} alt="Third slide" className="d-block w-50 m-auto" />
                        ]}
                      </Carousel>
                    </Card>
                  </Col>

                  {/* Dropdown */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='dropdown'>Dropdown</h2>
                    <Card className='mb-3' title=''>
                      {/* Dropdown Links */}
                      <Dropdown
                        toggleButton={{
                          icon: "list",
                          text: "Dropdown with Links"
                        }}
                        header="Account"
                        footer={<a href="/logout" className="dropdown-item text-danger">Logout</a>}
                        keepDropdownOpen={false}
                      >
                        <DropdownItem url="/profile">My Profile</DropdownItem>
                        <DropdownItem url="/settings">Settings</DropdownItem>
                        <DropdownItem onClick={() => alert("Clicked Help")}>Help</DropdownItem>
                      </Dropdown>
                    </Card>
                  </Col>

                  {/* Notifications */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='notification'>Notifications</h2>
                    <Card className='mb-3' title=''>
                      <Notifications badge={<span className="badge ">3</span>}>
                        {[
                          {
                            title: "New comment on your post",
                            url: "/comments/1",
                            time: "2m ago",
                            icon: "message"
                          },
                          {
                            title: "New follower: Jane Smith",
                            url: "/profile/jane-smith",
                            time: "10m ago",
                            icon: "user"
                          },
                          {
                            title: "Server downtime alert",
                            url: "/status",
                            time: "1h ago",
                            icon: "alert-triangle"
                          }
                        ]}
                      </Notifications>
                    </Card>
                  </Col>

                  {/* Search */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='search'>Search</h2>
                    <Card className='mb-3' title=''>
                      <Search />
                    </Card>
                  </Col>

                  {/* Form */}
                  <Col className="mb-5">
                    <h2 id='form'>Form</h2>
                    <Card className="mb-3" title="Basic Form with Manual Fields">
                      <p className="text-muted">
                        A simple form manually composed using standard field components. Suitable when you need full control over layout and fields.
                      </p>
                      <Form dataStoragePath="/demo/form/manual">
                        <String name="name" label="Name" />
                        <Email name="email" label="Email" />
                        <TextArea name="notes" label="Notes" />
                      </Form>
                    </Card>
                    {/* Form Template */}
                    <Card className="mb-3" title="Dynamic Form via Form using model">
                      <p className="text-muted">
                        Automatically generates form fields from a model object. Ideal for dynamic UIs, low-code interfaces, or admin panels.
                      </p>
                      Work in progress...
                    </Card>
                  </Col>

                  {/* Grid */}
                  <Col xs={12} className='mb-5'>
                    <h2 id='grid'>Grid</h2>
                    <Card className='mb-3' title=''>
                      <Grid
                        dataArray={[
                          {
                            id: 1,
                            name: "Alice Johnson",
                            email: "alice.johnson@example.com",
                            role: "Admin",
                            status: "Active"
                          },
                          {
                            id: 2,
                            name: "David Miller",
                            email: "david.miller@example.com",
                            role: "Editor",
                            status: "Inactive"
                          },
                          {
                            id: 3,
                            name: "Emma Wilson",
                            email: "emma.wilson@example.com",
                            role: "Viewer",
                            status: "Active"
                          },
                          {
                            id: 4,
                            name: "James Taylor",
                            email: "james.taylor@example.com",
                            role: "Admin",
                            status: "Suspended"
                          }
                        ]}
                        columns={[
                          { key: 'id', label: 'ID' },
                          { key: 'name', label: 'Name' },
                          { key: 'email', label: 'Email' },
                          { key: 'role', label: 'Role' },
                          { key: 'status', label: 'Status' }
                        ]}
                        onClick={() => { }}
                      />
                    </Card>
                  </Col>

                  {/* Pagination */}
                  <Col className="mb-5">
                    <h2 id='pagination'>Pagination</h2>
                    <Card className="mb-3" title="Basic Form with Manual Fields">
                      <Pagination recordSet={recordSet} limit={10}>
                        {(pageRecords: any) => pageRecords.map((component: any, index: number) => (
                          <p key={index}>{component}</p>
                        ))}
                      </Pagination>
                    </Card>
                  </Col>

                  {/* Menu */}
                  <Menu context='header' />

                </Row>

              </div>
            </Col>

            <Col xl={3}>

              {/* Sidebar menu with correct id for ScrollSpy */}
              <nav id='sidebar-bootstrap' className='navbar d-none d-xl-block' style={{ height: "80vh", overflowY: "auto" }}>
                <ul className='nav nav-pills flex-column'>
                  <li className='nav-item'>
                    <a href='#input' className='nav-link' data-toggle='scroll-to'>Input</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#selectors' className='nav-link' data-toggle='scroll-to'>Selectors</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#upload' className='nav-link' data-toggle='scroll-to'>Upload</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#alert' className='nav-link' data-toggle='scroll-to'>Alert</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#badge' className='nav-link' data-toggle='scroll-to'>Badge</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#buttons' className='nav-link' data-toggle='scroll-to'>Buttons</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#card' className='nav-link' data-toggle='scroll-to'>Card</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#gallery' className='nav-link' data-toggle='scroll-to'>Gallery</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#gridSystem' className='nav-link' data-toggle='scroll-to'>Grid System</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#images' className='nav-link' data-toggle='scroll-to'>Images</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#loader' className='nav-link' data-toggle='scroll-to'>Loader</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#modal' className='nav-link' data-toggle='scroll-to'>Modal</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#percentage' className='nav-link' data-toggle='scroll-to'>Percentage</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#repeat' className='nav-link' data-toggle='scroll-to'>Repeat</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#tab' className='nav-link' data-toggle='scroll-to'>Tab</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#table' className='nav-link' data-toggle='scroll-to'>Table</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#brand' className='nav-link' data-toggle='scroll-to'>Brand</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#breadcrumb' className='nav-link' data-toggle='scroll-to'>Breadcrumb</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#carousel' className='nav-link' data-toggle='scroll-to'>Carousel</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#dropdown' className='nav-link' data-toggle='scroll-to'>Dropdown</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#notification' className='nav-link' data-toggle='scroll-to'>Notifications</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#search' className='nav-link' data-toggle='scroll-to'>Search</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#form' className='nav-link' data-toggle='scroll-to'>Form</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#grid' className='nav-link' data-toggle='scroll-to'>Grid</a>
                  </li>
                  <li className='nav-item'>
                    <a href='#pagination' className='nav-link' data-toggle='scroll-to'>Pagination</a>
                  </li>
                </ul>
              </nav>
            </Col>
          </Row>
        </Col>

      </Row >

    </Container >
  )
}

export default Helper;