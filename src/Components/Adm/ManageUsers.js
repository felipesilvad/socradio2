import React, { useState, useEffect } from 'react';
import { query, collection, onSnapshot } from 'firebase/firestore';
import {firestore} from '../../firebase';
import {Table, Form} from 'react-bootstrap';
import Select from 'react-select'

function ManageUsers() {
  const [users, setUsers] = useState([])
  
  useEffect (() => {
    onSnapshot(query(collection(firestore, `/users`)), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})))
    });
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
    await firestore.collection('users').doc(userID).set({
      roles: roleValues,
    }, {merge: true})
    console.log(roleValues)
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
                  defaultValue={user.roles&&(roleOptions.filter(
                    option => user.roles.includes(option.value)
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