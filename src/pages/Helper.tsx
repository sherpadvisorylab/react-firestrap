import React from 'react'
import Grid from "../components/widgets/Grid";
import {Select} from "../components/ui/fields/Select";
import { Wrapper, Container, Row, Col } from "../components/ui/GridSystem";
import Card from "../components/ui/Card";
import { String, Number, Email, Date, Time, DateTime, DateInput, TextArea, Checkbox, ListGroup, SwitchInput, Label } from "../components/ui/fields/Input";
import { Autocomplete, Checklist } from "../components/ui/fields/Select";
import Upload from "../components/ui/fields/Upload";
import { ActionButton, LoadingButton, GoSite, ReferSite } from "../components/ui/Buttons";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import Notifications from "../components/blocks/Notifications";
import Search from "../components/blocks/Search";
import Form from "../components/widgets/Form";
import Tab from "../components/ui/Tab";
import Tab2 from "../components/ui/Tab2";
import Table from "../components/ui/Table";
import Brand from "../components/blocks/Brand";
import { Breadcrumbs } from "../components/blocks/Breadcrumbs";
import Carousel from "../components/blocks/Carousel";
import { Dropdown, DropdownLink, DropdownButton } from "../components/blocks/Dropdown";
import Image from "../components/ui/Image";
import Gallery from "../components/ui/Gallery";
import Loader from "../components/ui/Loader";
import Percentage from "../components/ui/Percentage";
import Repeat from "../components/ui/Repeat";
import Models from "../components/Models";
import Modal from "../components/ui/Modal";
import ImageEditor from "../components/widgets/ImageEditor";
import { PLACEHOLDER_BRAND, PLACEHOLDER_IMAGE } from '../Theme';
import { Menu } from '../components/blocks/Menu';




function Helper() {
  return (
    <Container className='mb-5'>
      <Row className='justify-content-center'>
        <Col xl={10}>
          <Row>
            <Col xl={9}>
              <h1>Helper</h1>
              <p>Helper is a component that helps you to create a form.</p>
              <Row>
                {/* Input */}
                <Col className='mb-5'>
                  <h2 id='input'>Input</h2>

                  {/* Text */}
                  <Card cardClass='my-3' title='Text Input'>
                    <form className='form-group'>
                      {/* String */}
                      <String name='text' label='Text input' inputClass='mb-3' placeholder='Lorem ipsum.' />
                      {/* Number */}
                      <Number name='number' label='Number input' inputClass='mb-3' value={10} />
                      {/* Email */}
                      <Email name='email' label='Email input' inputClass='mb-3' placeholder='test@example.com' />
                      {/* TextArea */}
                      <TextArea name='textarea' label='Text area' className='mb-3' placeholder='Lorem ipsum.' />
                    </form>
                  </Card>

                  {/* Date */}
                  <Card cardClass='my-3' title='Date Input'>
                    <form className='form-group'>
                      {/* Date */}
                      <Date name='date' label='Date' inputClass='mb-3' placeholder='YYYY-MM-DD' />
                      {/* Time */}
                      <Time name='time' label='Time' inputClass='mb-3' placeholder='HH:MM:SS' />
                      {/* DateTime */}
                      <DateTime name='datetime' label='DateTime' inputClass='mb-3' placeholder='YYYY-MM-DD HH:MM:SS' />
                      {/* Custom date */}
                      <DateInput name='dateInput' onChange={()=>{}} placeholder='YYYY-MM-DD' />
                    </form>
                  </Card>

                  {/* Boolean */}
                  <Card cardClass='my-3' title='Boolean Input'>
                    <form className='form-group'>
                      {/* Checkbox */}
                      <Label label='Checkboxes' />
                      <Checkbox name='checkbox' label='Checkbox1' />
                      <Checkbox name='checkbox' label='Checkbox2' checkboxClass='mb-3' value={true} />
                      {/* Switch */}
                      <Label label='Switches' />
                      <SwitchInput name='switch1' label='Switch input' onChange={()=>{}} status={false} />
                      <SwitchInput name='switch2' onChange={()=>{}} label='Switch input' className='mb-3' status={true} />
                    </form>
                  </Card>

                  {/* List -> Select? */}
                  <Card cardClass='my-3' title='List Input'>
                    <form className='form-group'>
                      <Label label='List Group' />
                      <ListGroup className='mb-3' onClick={()=>{}} active={0} items={[
                        <span className='text-danger'>Element1</span>,
                        <span className='text-success'>Element2</span>,
                        <span className='text-warning'>Element3</span>
                      ]} />
                    </form>
                  </Card>
                </Col>

                {/* Selectors */}
                <Col className='mb-5'>
                  <h2 id='selectors'>Selectors</h2>
                  <Card cardClass='mb-3'>
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
                <Col className='mb-5'>
                  <h2 id='upload'>Upload</h2>
                  <Card cardClass='mb-3'>
                    <form className='form-group'>
                      <Upload name='upload' label='Upload' className='mb-3' />
                    </form>
                  </Card>
                </Col>

                {/* Alert */}
                <Col className='mb-5'>
                  <h2 id='alert'>Alert</h2>
                  <Card cardClass='mb-3'>
                    <Alert type="info" children="Info" />
                    <Alert type="success" children="Success" />
                    <Alert type="warning" children="Warning" />
                    <Alert type="danger" children="Danger" />
                    <Alert type="primary" children="Primary" />
                    <Alert type="secondary" children="Secondary" />
                    <Alert type="light" children="Light" />
                    <Alert type="dark" children="Dark" />
                  </Card>
                </Col>

                {/* Badge */}
                <Col className='mb-5'>
                  <h2 id='badge'>Badge</h2>
                  <Card cardClass='mb-3'>
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
                <Col className='mb-5'>
                  <h2 id='buttons'>Buttons</h2>
                  <Card cardClass='mb-3'>
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
                          imageUrl= {PLACEHOLDER_BRAND}
                          width={120}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>

                {/* Card */}
                <Col className='mb-5'>
                  <h2 id='card'>Card</h2>
                  <Card cardClass='mb-3'>
                    <Card
                      title="Card Title"
                      header={<span className="text-muted">Header</span>}
                      footer={<div>Footer with actions.</div>}
                      showLoader={false}
                      showArrow={true}
                      cardClass="shadow-sm"
                      wrapClass="my-3"
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
                <Col className='mb-5'>
                  <h2 id='gallery'>Gallery</h2>
                  <Card cardClass='mb-3'>
                    <Gallery
                      body={
                        [
                          {
                            thumbnail: PLACEHOLDER_IMAGE,
                            name: 'Foto 1',
                            mimetype: '', // oppure "" se non serve
                            width: 200,
                            height: 150,
                          },
                          {
                            thumbnail: PLACEHOLDER_IMAGE,
                            name: 'Foto 2',
                            mimetype: '',
                            width: 200,
                            height: 150,
                          },
                          {
                            thumbnail: PLACEHOLDER_IMAGE,
                            name: 'Foto 1',
                            mimetype: '', // oppure "" se non serve
                            width: 200,
                            height: 150,
                          },
                          {
                            thumbnail: PLACEHOLDER_IMAGE,
                            name: 'Foto 2',
                            mimetype: '',
                            width: 200,
                            height: 150,
                          },
                        ]
                      }
                      Header={<h5>Galleria immagini</h5>}
                    />
                  </Card>
                </Col>

                {/* GridSystem */}
                <Col className='mb-5'>
                  <h2 id='gridSystem'>GridSystem</h2>
                  <Card cardClass='mb-3'>
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
                <Col className='mb-5'>
                  <h2 id='images'>Images</h2>
                  <Card cardClass='mb-3' title='Image'>
                    <p>This is the standard HTML tag for displaying an image. It is simple and easy to use, but it doesn’t handle errors, fallbacks, or custom caching. If the image fails to load, the user will see a broken image icon.

                    </p>
                    <Image
                      src={PLACEHOLDER_IMAGE}
                      className="img-fluid"
                      width={150}
                      height={150}
                    />
                  </Card>
                  {/* ImageAvatar */}
                  <Card cardClass='mb-3' title='Image Avatar'>
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
                <Col className='mb-5'>
                  <h2 id='loader'>Loader</h2>
                  <Card cardClass='mb-3'>
                    <Loader
                      children="Loading..."
                      show={true}
                    />
                  </Card>
                </Col>

                {/* Modal */}
                {/* <Col className='mb-5'>
          <h2 id='modal'>Modal</h2>
          <Card cardClass='mb-3' title=''>
            <Modal children='content' />
          </Card>
        </Col> */}

                {/* Percentage */}
                <Col className='mb-5'>
                  <h2 id='percentage'>Percentage</h2>
                  <Card cardClass='mb-3' title=''>
                    <Percentage min={0} max={10} val={7} children='Rounded' />
                    <Percentage min={0} max={10} val={3} children='Progress' styleType='progress' />
                  </Card>
                </Col>

                {/* Repeat */}
                <Col className='mb-5'>
                  <h2 id='repeat'>Repeat</h2>
                  <Card cardClass='mb-3' title=''>
                    <Repeat>
                      <String name='repeat' label='Repeat 1' inputClass='mb-3' placeholder='Lorem ipsum.' />
                      <String name='repeat' label='Repeat 2' inputClass='mb-3' placeholder='Lorem ipsum.' />
                      <String name='repeat' label='Repeat 3' inputClass='mb-3' placeholder='Lorem ipsum.' />
                      </Repeat>
                  </Card>
                </Col>

                {/* Tab */}
                <Col className='mb-5'>
                  <h2 id='tab'>Tab</h2>
                  <Card cardClass='mb-3' title='Dynamic Tabs (Tab)'>

                    <Label label='Tab Top' />
                    <Tab children='Lorem ipsum.' min={3} label='Tab' />

                    <Label label='Tab Left' className='mt-3' />
                    <Tab children='Lorem ipsum.' min={3} label='Tab' tabPosition='left' />

                    <Label label='Tab Right' className='mt-3' />
                    <Tab children='Lorem ipsum.' min={3} label='Tab' tabPosition='right' />

                  </Card>
                  <Card cardClass='mb-3' title='Simple Tabs (Tab2)'>
                    <Tab2 items={[
                      { content: 'Lorem ipsum.', label: 'Tab1' },
                      { content: 'Lorem ipsum.', label: 'Tab2' },
                      { content: 'Lorem ipsum.', label: 'Tab3' },
                    ]} />
                  </Card>
                </Col>

                {/* Table */}
                <Col className='mb-5'>
                  <h2 id='table'>Table</h2>
                  <Card cardClass='mb-3' title=''>
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
                    />
                  </Card>
                </Col>

                {/* Brand */}
                <Col className='mb-5'>
                  <h2 id='brand'>Brand</h2>
                  <Card cardClass='mb-3' title=''>
                    <Brand url='https://it.wikipedia.org/wiki/Sicurezza_informatica' src={PLACEHOLDER_BRAND} label='Cyber' />
                  </Card>
                </Col>

                {/* Breadcrumbs */}
                <Col className='mb-5'>
                  <h2 id='breadcrumb'>Breadcrumbs</h2>
                  <Card cardClass='mb-3' title=''>
                    <Breadcrumbs className="mb-3" pre={<i className="bi bi-house-door-fill" />} />
                  </Card>
                </Col>

                {/* Carousel */}
                <Col className='mb-5'>
                  <h2 id='carousel'>Carousel</h2>
                  <Card cardClass='mb-3' title=''>
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
                <Col className='mb-5'>
                  <h2 id='dropdown'>Dropdown</h2>
                  <Card cardClass='mb-3' title=''>
                    {/* Dropdown Links */}
                    <Dropdown
                      icon="list"
                      label="Dropdown with Links"
                      header="Account"
                      footer={<a href="/logout" className="dropdown-item text-danger">Logout</a>}
                      keepDropdownOpen={false}
                    >
                      <DropdownLink url="/profile">My Profile</DropdownLink>
                      <DropdownLink url="/settings">Settings</DropdownLink>
                      <DropdownLink onClick={() => alert("Clicked Help")}>Help</DropdownLink>
                    </Dropdown>

                    {/* Dropdown Buttons */}
                    <Dropdown
                      icon="list"
                      label="Dropdown with Buttons"
                      keepDropdownOpen={true} // opzionale
                    >
                      <DropdownButton>Download</DropdownButton>
                      <DropdownButton>Share</DropdownButton>
                      <DropdownButton>Archive</DropdownButton>
                    </Dropdown>
                  </Card>
                </Col>

                {/* Notifications */}
                <Col className='mb-5'>
                  <h2 id='notification'>Notifications</h2>
                  <Card cardClass='mb-3' title=''>
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
                <Col className='mb-5'>
                  <h2 id='search'>Search</h2>
                  <Card cardClass='mb-3' title=''>
                    <Search />
                  </Card>
                </Col>

                {/* Form */}
                <Col className="mb-5">
                  <h2 id='form'>Form</h2>
                  <Card cardClass="mb-3" title="Basic Form with Manual Fields">
                    <p className="text-muted">
                      A simple form manually composed using standard field components. Suitable when you need full control over layout and fields.
                    </p>
                    <Form dataStoragePath="/demo/form/manual">
                      <String name="name" label="Name" />
                      <Email name="email" label="Email" />
                      <TextArea name="notes" label="Notes" />
                    </Form>
                  </Card>
                  {/* Form Composer */}
                  <Card cardClass="mb-3" title="Dynamic Form via Form using model">
                    <p className="text-muted">
                      Automatically generates form fields from a model object. Ideal for dynamic UIs, low-code interfaces, or admin panels.
                    </p>
                    <Form
                      dataStoragePath="/demo/form/composer"
                      model={{
                        fullName: Models.input.string(),
                        birthDate: Models.input.date({ value: "ciao" }),
                        email: Models.input.email({ value: "ciao" }),
                      }}
                    />
                  </Card>
                </Col>

                {/* Grid */}
                <Col className='mb-5'>
                  <h2 id='grid'>Grid</h2>
                  <Card cardClass='mb-3' title=''>
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

                {/* Menu */}
                <Menu context='header' />

                {/* Image Editor -> blocca tutto */}
                {/*  <Col className='mb-5'>
          <h2 id='imageEditor'></h2>
          <Card cardClass='mb-3' title=''>
            <ImageEditor imageUrl='' />
          </Card>
        </Col> */}

              </Row>
            </Col>
            <Col xl={3}>
              <nav id='sidebar-bootstrap' className='navbar navbar-sticky d-none d-xl-block'>
                <nav className='nav'>
                  <a href='#input' className='nav-link' data-toggle='scroll-to'>Input</a>
                  <a href='#selectors' className='nav-link' data-toggle='scroll-to'>Selectors</a>
                  <a href='#upload' className='nav-link' data-toggle='scroll-to'>Upload</a>
                  <a href='#alert' className='nav-link' data-toggle='scroll-to'>Alert</a>
                  <a href='#badge' className='nav-link' data-toggle='scroll-to'>Badge</a>
                  <a href='#buttons' className='nav-link' data-toggle='scroll-to'>Buttons</a>
                  <a href='#card' className='nav-link' data-toggle='scroll-to'>Card</a>
                  <a href='#gallery' className='nav-link' data-toggle='scroll-to'>Gallery</a>
                  <a href='#gridSystem' className='nav-link' data-toggle='scroll-to'>Grid System</a>
                  <a href='#images' className='nav-link' data-toggle='scroll-to'>Images</a>
                  <a href='#loader' className='nav-link' data-toggle='scroll-to'>Loader</a>
                  <a href='#modal' className='nav-link' data-toggle='scroll-to'>Modal</a>
                  <a href='#percentage' className='nav-link' data-toggle='scroll-to'>Percentage</a>
                  <a href='#repeat' className='nav-link' data-toggle='scroll-to'>Repeat</a>
                  <a href='#tab' className='nav-link' data-toggle='scroll-to'>Tab</a>
                  <a href='#table' className='nav-link' data-toggle='scroll-to'>Table</a>
                  <a href='#brand' className='nav-link' data-toggle='scroll-to'>Brand</a>
                  <a href='#breadcrumb' className='nav-link' data-toggle='scroll-to'>Breadcrumb</a>
                  <a href='#carousel' className='nav-link' data-toggle='scroll-to'>Carousel</a>
                  <a href='#dropdown' className='nav-link' data-toggle='scroll-to'>Dropdown</a>
                  <a href='#notification' className='nav-link' data-toggle='scroll-to'>Notifications</a>
                  <a href='#search' className='nav-link' data-toggle='scroll-to'>Search</a>
                  <a href='#form' className='nav-link' data-toggle='scroll-to'>Form</a>
                  <a href='#grid' className='nav-link' data-toggle='scroll-to'>Grid</a>
                  <a href='#imageEditor' className='nav-link' data-toggle='scroll-to'>Image Editor</a>
                </nav>
              </nav>
            </Col>
          </Row>
        </Col>
      </Row>

    </Container>
  )
}

export default Helper;