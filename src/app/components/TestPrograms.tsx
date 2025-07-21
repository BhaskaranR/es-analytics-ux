import React, { useState } from 'react';

import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';

const ProgramsPage = () => {
    const [hideInactive, setHideInactive] = useState(false);
    const [programs, setPrograms] = useState([]); // Simulated program list

    return (
        <Container fluid className='p-4'>
            <h2 className='mb-4'>Programs</h2>

            {/* Toolbar */}
            <Row className='align-items-center justify-content-between mb-3'>
                <Col xs='auto'>
                    <Form.Check
                        type='switch'
                        id='hide-inactive-switch'
                        label='Hide inactive'
                        checked={hideInactive}
                        onChange={(e) => setHideInactive(e.target.checked)}
                    />
                </Col>
                <Col xs='auto'>
                    <div className='d-flex align-items-center gap-3'>
                        <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc' }} />
                        <Button variant='primary' onClick={() => alert('Add program clicked')}>
                            + Add program
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Program List or Empty State */}
            {programs.length === 0 ? (
                <Card className='p-4 text-center'>
                    <Card.Body>
                        <p className='mb-0'>
                            No programs have been created. Please use the "Create program" button to add a program.
                        </p>
                    </Card.Body>
                </Card>
            ) : (
                <div>{/* Render your list of programs here */}</div>
            )}
        </Container>
    );
};

export default ProgramsPage;
