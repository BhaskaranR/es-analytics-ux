import React, { useEffect, useMemo, useRef, useState } from 'react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';

const ActionMenu = ({ onClone, onDelete }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 4
                }}>
                <i className='hlx hlx-control-menu-overflow' />
            </button>

            {open && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        background: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        zIndex: 10,
                        minWidth: 100
                    }}>
                    <div
                        onClick={() => {
                            onClone();
                            setOpen(false);
                        }}
                        style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee'
                        }}>
                        Clone
                    </div>
                    <div
                        onClick={() => {
                            onDelete();
                            setOpen(false);
                        }}
                        style={{ padding: '8px 12px', cursor: 'pointer', color: 'red' }}>
                        Delete
                    </div>
                </div>
            )}
        </div>
    );
};

const CyclesGrid = () => {
    const [rowData, setRowData] = useState([
        {
            id: 1,
            cycleName: '2025 Cycle 1',
            version: '0001',
            participants: '3,000',
            startDate: '06/09/2025',
            endDate: '06/20/2025',
            status: 'Active'
        },
        {
            id: 2,
            cycleName: 'Clone-2025 Cycle 1',
            version: '0001-2',
            participants: '0',
            startDate: '06/09/2025',
            endDate: '06/20/2025',
            status: 'Inactive'
        }
    ]);

    const columnDefs = useMemo(
        () => [
            {
                headerName: 'Cycle name',
                field: 'cycleName',
                cellRenderer: (params) => <a href='#'>{params.value}</a>
            },
            { headerName: 'Version', field: 'version' },
            { headerName: 'Participants', field: 'participants' },
            { headerName: 'Schedule start date', field: 'startDate' },
            { headerName: 'Schedule end date', field: 'endDate' },
            { headerName: 'Status', field: 'status' },
            {
                headerName: 'Actions',
                field: 'actions',
                cellRenderer: (params) => (
                    <ActionMenu
                        onClone={() => {
                            const row = params.data;
                            const newRow = {
                                ...row,
                                id: Date.now(),
                                cycleName: `Clone-${row.cycleName}`,
                                version: `${row.version}-2`,
                                participants: '0',
                                status: 'Inactive'
                            };
                            setRowData((prev) => [...prev, newRow]);
                        }}
                        onDelete={() => {
                            const id = params.data.id;
                            setRowData((prev) => prev.filter((r) => r.id !== id));
                        }}
                    />
                )
            }
        ],
        []
    );

    const defaultColDef = {
        sortable: true,
        resizable: true,
        filter: true
    };

    return (
        <div className='ag-theme-alpine' style={{ height: 300, width: '100%' }}>
            <AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} rowHeight={55} />
        </div>
    );
};

export default CyclesGrid;
