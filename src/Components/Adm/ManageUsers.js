import React, { useState, useEffect } from 'react';
import { db, subscriptions } from '../../supabase';
import {Table, Form} from 'react-bootstrap';
import Select from 'react-select'

function ManageUsers() {
  const [users, setUsers] = useState([])
  
  useEffect (() => {
    const fetchUsers = async () => {
      try {
        const usersData = await db.getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [])

  const roleOptions = [
    { value: 'Donator', label: 'Donator' },
    { value: 'Moderator', label: 'Moderator' },
    { value: 'Subscriber', label: 'Subscriber' },
    { value: 'Admin', label: 'Admin' },
  ]

  const customStyles = {
    option: provided => ({
      ...provided,
      color: 'black'
    }),
    control: provided => ({
      ...provided,
      color: 'black'
    }),
    singleValue: provided => ({
      ...provided,
      color: 'black'
    })
  }

  const updateRoles = async (roles, userID) => {
    var roleValues = []
    roles.forEach(element => {
      roleValues.push(element.value)
    });
    try {
      await db.updateUserRoles(userID, roleValues);
      console.log(roleValues);
    } catch (error) {
      console.error('Error updating user roles:', error);
    }
  }

  return (
    <div className='users-display'>
      <h3 className='ardela text-center'>Users</h3>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>email</th>
            <th>username</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr>
              <td>{user.email}</td>
              <td>{user.username}</td>
              <td>
                <Select
                  closeMenuOnSelect={false}
                  defaultValue={user.user_roles&&(roleOptions.filter(
                    option => user.user_roles.some(r => r.role === option.value)
                  ))}
                  isMulti
                  options={roleOptions}
                  styles={customStyles}
                  onChange={(e) => updateRoles(e,user.uid)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
    </div>
  )
  ;
}

export default ManageUsers;