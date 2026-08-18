"""

App route testing

"""

def test_home_page(client):
    response = client.get('/')
    
    assert response.status_code == 200

#def test_submit_form_success(client):
#    """Test a POST request with form data."""
#    payload = {}
#    
#    response = client.post('/search-icao', data=payload)
#    
#    assert response.status_code == 302 

def test_api_json_response(client):
    """Test an API endpoint returning JSON data."""
    response = client.get('/clear_uploads')
    
    assert response.status_code == 200
    assert response.is_json
    
    json_data = response.get_json()
    assert json_data["status"] == "success"
